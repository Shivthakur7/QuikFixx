import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { RedisModule } from '../redis/redis.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [RedisModule, ProvidersModule],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
