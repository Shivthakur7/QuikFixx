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

  async updateLocation(userId: string, lat: number, lng: number) {
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
    await this.providersRepository.save(provider);

    // 2. Update Redis (Real-time)
    // Assuming we have categories. For now hardcode or fetch from skills.
    const category = provider.skillTags?.[0] || 'general';
    await this.redisService.updateProviderLocation(
      userId, // Use userId so DispatchService returns userId, matching Socket room
      lat,
      lng,
      category,
    );

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
          validCandidates.push({
            ...candidate,
            name: providerDetails.user.fullName,
            providerEntityId: providerDetails.id,
            skillTags: providerDetails.skillTags
          });
        }
      }
    }
    return validCandidates;
  }

  async findByUserId(userId: string) {
    return this.providersRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }
}
