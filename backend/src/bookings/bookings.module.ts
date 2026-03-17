import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { Review } from '../entities/review.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DispatchModule } from '../dispatch/dispatch.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Review]), DispatchModule, ProvidersModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule { }
