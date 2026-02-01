import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Order } from '../entities/order.entity';
import { EventsGateway } from '../events/events.gateway';

import { ProvidersService } from '../providers/providers.service';

export interface Candidate {
  providerId: string; // This is actually the User ID (redis key)
  name?: string;
  providerEntityId?: string; // The actual Provider Table ID
  distance: number;
  location: { lat: number; lng: number };
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private redisService: RedisService,
    private eventsGateway: EventsGateway,
    private providersService: ProvidersService,
  ) { }

  async dispatchOrder(order: Order) {
    // ... (logging)
    this.logger.log(
      `Dispatching Order ${order.id} for service ${order.serviceType}`,
    );

    const RADIUS_KM = 5;
    const candidates = await this.redisService.getNearbyProviders(
      order.locationLat,
      order.locationLng,
      RADIUS_KM,
      order.serviceType || 'general',
    );

    this.logger.log(
      `Found ${candidates.length} candidates in ${RADIUS_KM}km radius`,
    );

    const validCandidates: Candidate[] = [];
    for (const candidate of candidates) {
      // 1. Check Status
      const status = await this.redisService.getProviderStatus(
        candidate.providerId,
      );

      if (status === 'ONLINE') {
        // 2. Fetch Details (Name)
        // Redis stores userId as providerId
        const providerDetails = await this.providersService.findByUserId(candidate.providerId);
        if (providerDetails && providerDetails.user) {
          validCandidates.push({
            ...candidate,
            name: providerDetails.user.fullName,
            providerEntityId: providerDetails.id // The actual Provider Table ID
          });
        }
      }
    }

    this.logger.log(`Found ${validCandidates.length} ONLINE candidates`);

    if (validCandidates.length === 0) {
      return { dispatched: false, reason: 'NO_PROVIDERS_FOUND' };
    }

    // Broadcast
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
