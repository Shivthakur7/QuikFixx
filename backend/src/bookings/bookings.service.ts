import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private dispatchService: DispatchService,
  ) { }

  async createBooking(userId: string, createOrderDto: any) {
    // 1. Create Order in DB
    const newOrder = this.ordersRepository.create({
      customerId: userId,
      serviceType: createOrderDto.serviceType,
      locationLat: createOrderDto.location.lat,
      locationLng: createOrderDto.location.lng,
      status: OrderStatus.PENDING,
      priceEstimated: 500.0, // Mock pricing
      locationGeo: {
        type: 'Point',
        coordinates: [createOrderDto.location.lng, createOrderDto.location.lat],
      },
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    // 2. Trigger Dispatch Engine
    const dispatchResult = await this.dispatchService.dispatchOrder(savedOrder);

    return {
      order: savedOrder,
      dispatch: dispatchResult,
    };
  }

  async findOne(id: string) {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async findMyBookings(userId: string) {
    return this.ordersRepository.find({
      where: { customerId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
