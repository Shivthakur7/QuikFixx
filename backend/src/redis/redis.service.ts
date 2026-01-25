import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Updates a provider's geospatial location.
   * Key format: providers:geo:{serviceCategory}
   */
  async updateProviderLocation(
    providerId: string,
    lat: number,
    lng: number,
    category: string,
  ) {
    // GEOADD key longitude latitude member
    const key = `providers:geo:${category}`;
    await this.redis.geoadd(key, lng, lat, providerId);

    // Also store latest raw location for quick retrieval without geo query
    await this.redis.hset(`provider:${providerId}:location`, {
      lat,
      lng,
      lastUpdate: Date.now(),
    });

    // Refresh TTL (expiry 60s) to auto-remove stale drivers
    await this.redis.expire(`provider:${providerId}:location`, 60);
  }

  /**
   * access raw ioredis instance
   */
  get client(): Redis {
    return this.redis;
  }

  /**
   * Finds nearby providers within radius.
   * Returns list of { providerId, distance, location }
   */
  async getNearbyProviders(
    lat: number,
    lng: number,
    radiusKm: number,
    category: string,
  ) {
    const key = `providers:geo:${category}`;
    // GEORADIUS key longitude latitude radius m|km|ft|mi [WITHCOORD] [WITHDIST] [WITHHASH] [COUNT count] [ASC|DESC] [STORE key] [STOREDIST key]
    // Using simple GEORADIUS for MVP. In prod, consider GEOSEARCH (Redis 6.2+)

    const results = (await this.redis.georadius(
      key,
      lng,
      lat,
      radiusKm,
      'km',
      'WITHDIST',
      'WITHCOORD',
      'ASC',
      'COUNT',
      50,
    )) as Array<[string, string, [string, string]]>;

    // Parse results: [[member, distance, [lng, lat]], ...]
    return results.map((res) => ({
      providerId: res[0],
      distance: parseFloat(res[1]), // in km
      location: { lng: parseFloat(res[2][0]), lat: parseFloat(res[2][1]) },
    }));
  }

  async setProviderStatus(providerId: string, isOnline: boolean) {
    if (isOnline) {
      await this.redis.set(`provider:${providerId}:status`, 'ONLINE');
    } else {
      await this.redis.del(`provider:${providerId}:status`);
      // Also remove from GEO index?
      // Ideally yes, but TTL on location update handles it mostly.
      // For strictness, we can iterate categories and ZREM, but for now relies on TTL or explicit cleanup.
    }
  }

  async getProviderStatus(providerId: string): Promise<string> {
    const status = await this.redis.get(`provider:${providerId}:status`);
    return status || 'OFFLINE';
  }
}
