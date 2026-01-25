import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Order } from '../entities/order.entity';
import { EventsGateway } from '../events/events.gateway';

export interface Candidate {
  providerId: string;
  distance: number;
  location: { lat: number; lng: number };
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private redisService: RedisService,
    private eventsGateway: EventsGateway
  ) { }

  async dispatchOrder(order: Order) {
    this.logger.log(
      `Dispatching Order ${order.id} for service ${order.serviceType}`,
    );

    // 1. Find Search Radius (Start small: 3km)
    const RADIUS_KM = 3;

    // 2. Query Redis for candidates
    // Assuming serviceType maps directly to redis category
    const candidates = await this.redisService.getNearbyProviders(
      order.locationLat,
      order.locationLng,
      RADIUS_KM,
      order.serviceType || 'general',
    );

    this.logger.log(
      `Found ${candidates.length} candidates in ${RADIUS_KM}km radius`,
    );

    // 3. Filter by Online Status
    // Ideally use MGET to check status for all candidates quickly
    // For MVP, filter sequentially or assume Redis return is enough if we manage sets carefully
    // But we are storing status in separate key `provider:ID:status`.

    const validCandidates: Candidate[] = [];
    for (const candidate of candidates) {
      const status = await this.redisService.getProviderStatus(
        candidate.providerId,
      );
      if (status === 'ONLINE') {
        validCandidates.push(candidate);
      }
    }

    this.logger.log(`Found ${validCandidates.length} ONLINE candidates`);

    if (validCandidates.length === 0) {
      // Todo: Implement expansion logic (retry with larger radius)
      return { dispatched: false, reason: 'NO_PROVIDERS_FOUND' };
    }

    // 4. Sort by Distance (Redis GEORADIUS already allows sorting, but double check)
    // We used 'ASC' in RedisService, so it's sorted.

    // 5. Broadcast (Simulated for HTTP MVP -> Real WebSockets Phase 4)
    // In a real WebSocket app, we would emit events here.
    for (const candidate of validCandidates) {
      this.eventsGateway.notifyUser(candidate.providerId, 'booking.new', {
        orderId: order.id,
        serviceType: order.serviceType,
        location: { lat: order.locationLat, lng: order.locationLng },
        price: order.priceEstimated
      });
      this.logger.log(`Notified provider ${candidate.providerId} via WebSocket`);
    }

    return {
      dispatched: true,
      candidates: validCandidates,
      count: validCandidates.length,
    };
  }
}
