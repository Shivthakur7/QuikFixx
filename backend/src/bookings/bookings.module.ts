import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), DispatchModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
