import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private providersRepository: Repository<Provider>,
    private redisService: RedisService,
  ) { }

  async createProvider(userId: string, skills: string[]) {
    // Check if exists
    const existing = await this.providersRepository.findOne({ where: { userId } });
    if (existing) return existing;

    const provider = this.providersRepository.create({
      userId,
      skillTags: skills,
      isOnline: false,
    });
    return this.providersRepository.save(provider);
  }

  async updateLocation(userId: string, lat: number, lng: number, address?: string) {
    const provider = await this.providersRepository.findOne({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    // 1. Update Persistent DB (PostGIS)
    // Use raw query or object update. Object update with GeoJSON:
    provider.currentLocation = {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON is [lng, lat]
    };
    if (address) {
      provider.address = address;
    }
    await this.providersRepository.save(provider);

    // 2. Update Redis (Real-time)
    const categories = (provider.skillTags && provider.skillTags.length > 0)
      ? provider.skillTags
      : ['general'];

    for (const category of categories) {
      await this.redisService.updateProviderLocation(
        userId,
        lat,
        lng,
        category,
      );
    }

    return { success: true };
  }

  async setStatus(userId: string, isOnline: boolean) {
    const provider = await this.providersRepository.findOne({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    provider.isOnline = isOnline;
    await this.providersRepository.save(provider);

    await this.redisService.setProviderStatus(userId, isOnline);

    return { status: isOnline ? 'ONLINE' : 'OFFLINE' };
  }

  async submitVerification(userId: string, filename: string) {
    const provider = await this.providersRepository.findOne({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider not found');

    provider.aadhaarCardUrl = `/uploads/${filename}`;
    provider.verificationStatus = 'PENDING';

    return this.providersRepository.save(provider);
  }

  async getProviderById(id: string) {
    return this.providersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async searchProviders(lat: number, lng: number, serviceType: string, radius: number = 5) {
    const candidates = await this.redisService.getNearbyProviders(
      lat,
      lng,
      radius,
      serviceType,
    );

    const validCandidates: any[] = [];
    for (const candidate of candidates) {
      // 1. Check Status
      const status = await this.redisService.getProviderStatus(candidate.providerId);
      if (status === 'ONLINE') {
        // 2. Fetch Details
        const providerDetails = await this.findByUserId(candidate.providerId);
        if (providerDetails && providerDetails.user) {

          // 3. Fetch Stats (Jobs Done & Reviews)
          const jobsDone = await this.providersRepository.manager
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('orders', 'order')
            .where('order.providerId = :pid', { pid: providerDetails.id })
            .andWhere("order.status = 'COMPLETED'")
            .getRawOne();

          const reviewCount = await this.providersRepository.manager
            .count('reviews', { where: { provider: { id: providerDetails.id } } });

          // Calculate Member Since / Experience
          const memberSince = new Date(providerDetails.createdAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - memberSince.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const experienceString = diffDays > 365 ? `${Math.floor(diffDays / 365)} Years` : `${diffDays} Days`;

          validCandidates.push({
            ...candidate,
            name: providerDetails.user.fullName,
            providerEntityId: providerDetails.id,
            skillTags: providerDetails.skillTags,
            rating: providerDetails.rating, // Ensure we pass the rating from DB
            stats: {
              jobsDone: parseInt(jobsDone.count) || 0,
              reviewCount: reviewCount || 0,
              experience: experienceString
            }
          });
        }
      }
    }
    return validCandidates;
  }

  async findByUserId(userId: string): Promise<Provider | null> {
    return this.providersRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async findById(id: string): Promise<Provider | null> {
    return this.providersRepository.findOne({ where: { id } });
  }

  async updateBalance(providerId: string, newBalance: number) {
    await this.providersRepository.update(providerId, { balance: newBalance });
  }

  async updateRating(providerId: string) {
    // This requires Review repository access or a raw query. 
    // Since ProvidersService doesn't inject ReviewRepo (circular dep risk if logic in ReviewService calls ProviderService),
    // we can use a raw query or forwardRef. 
    // Simplest: ReviewService calls this, but ProviderService needs to know how to calculate.
    // Let's use QueryBuilder on Provider entity to join reviews? No, easier to inject EntityManager or just do it in ReviewService?
    // ReviewService triggered this, so it's active. 
    // Actually, let's keep it simple: ReviewService calculates and just calls providersRepository.update().
    // BUT user asked for `updateRating` in ProvidersService.
    // Let's assume we can query the reviews table using QueryRunner or similar if we don't want to inject ReviewRepo.

    // Better approach: Let ReviewsService handle the calculation logic (it has access to Review Repo) 
    // and pass the new average to ProvidersService.updateAverage(id, avg).
    // OR create a method here that uses `this.providersRepository.manager` to query reviews.

    const result = await this.providersRepository.manager
      .createQueryBuilder()
      .select('AVG(review.rating)', 'average')
      .from('reviews', 'review')
      .where('review.provider_id = :providerId', { providerId })
      .getRawOne();

    const averageRating = parseFloat(result.average) || 5.0; // Default to 5.0 if no reviews? Or 0? Let's say 5 for new. 

    await this.providersRepository.update(providerId, {
      rating: parseFloat(averageRating.toFixed(2))
    });
  }
}
