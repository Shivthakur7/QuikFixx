import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Review } from '../entities/review.entity';
import { DispatchService } from '../dispatch/dispatch.service';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private dispatchService: DispatchService,
    private providersService: ProvidersService,
  ) { }

  async createBooking(userId: string, createOrderDto: any) {
    // Construct Service Type with Items if available
    let serviceType = createOrderDto.serviceType;
    if (createOrderDto.items && createOrderDto.items.length > 0) {
      const itemNames = createOrderDto.items.map((i: any) => i.name).join(', ');
      serviceType = `${serviceType}: ${itemNames}`;
    }

    // 1. Create Order in DB
    const newOrder = this.ordersRepository.create({
      customerId: userId,
      serviceType: serviceType,
      locationLat: createOrderDto.location.lat,
      locationLng: createOrderDto.location.lng,
      status: OrderStatus.PENDING, // Enforce PENDING
      priceEstimated: createOrderDto.price || 500.0,
      providerId: createOrderDto.providerId || null, // Direct assignment if provided
      locationGeo: {
        type: 'Point',
        coordinates: [createOrderDto.location.lng, createOrderDto.location.lat],
      },
      address: createOrderDto.address || 'Address not provided',
      scheduledAt: createOrderDto.scheduledAt || null,
    });

    // Double-check status before save
    newOrder.status = OrderStatus.PENDING;
    console.log(`Creating Booking. Customer: ${userId}, Provider (Direct): ${newOrder.providerId}, Status: ${newOrder.status}`);

    const savedOrder = await this.ordersRepository.save(newOrder);

    // Fetch full order to ensure WS events receive customer info (syncs with loadData pattern)
    const fullOrder = await this.ordersRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['customer'],
      select: {
          id: true,
          status: true,
          serviceType: true,
          priceEstimated: true,
          priceFinal: true,
          createdAt: true,
          address: true,
          locationLat: true,
          locationLng: true,
          startJobOtp: true,
          endJobOtp: true,
          scheduledAt: true,
          customer: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true
          }
      }
    });

    // 2. Dispatch Logic
    let dispatchResult: any = { dispatched: false, reason: 'DIRECT_BOOKING' };

    if (createOrderDto.providerId) {
      // Direct Booking: Notify specific provider
      console.log(`Direct booking for provider ${createOrderDto.providerId}. Notification skipped for MVP step.`);
      dispatchResult = { dispatched: true, reason: 'DIRECT_ASSIGNMENT' };
    } else {
      // Standard Dispatch
      dispatchResult = await this.dispatchService.dispatchOrder(fullOrder || savedOrder);
    }

    return {
      order: fullOrder || savedOrder,
      dispatch: dispatchResult,
    };
  }

  async findOne(id: string) {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async findMyBookings(userId: string) {
    const orders = await this.ordersRepository.find({
      where: { customerId: userId },
      order: { createdAt: 'DESC' },
      relations: ['provider', 'provider.user'],
    });

    // Stamp each order with hasReview so frontend can hide/show the Rate button
    const ordersWithReview = await Promise.all(
      orders.map(async (order) => {
        const review = await this.reviewsRepository.findOne({ where: { orderId: order.id } });
        return { ...order, hasReview: !!review };
      })
    );

    return ordersWithReview;
  }

  async findProviderBookings(userId: string) {
    // 1. Resolve Provider ID from User ID
    const provider = await this.providersService.findByUserId(userId);
    if (!provider) {
      // If not a provider, return empty
      return [];
    }

    // 2. Find Orders
    return this.ordersRepository.find({
      where: { providerId: provider.id }, 
      order: { createdAt: 'DESC' },
      relations: ['customer'], // Customer points to User entity which has phone and fullName
      select: {
          id: true,
          status: true,
          serviceType: true,
          priceEstimated: true,
          priceFinal: true,
          createdAt: true,
          address: true,
          locationLat: true,
          locationLng: true,
          startJobOtp: true,
          endJobOtp: true,
          scheduledAt: true,
          customer: {
              id: true,
              fullName: true,
              phoneNumber: true,
              email: true
          }
      }
    });
  }
  async updateStatus(bookingId: string, status: OrderStatus, providerUserId?: string) {
    const order = await this.ordersRepository.findOne({ where: { id: bookingId } });
    if (!order) {
      throw new Error('Booking not found');
    }

    // If accepting, assign the provider if not already assigned
    if (status === OrderStatus.ACCEPTED && providerUserId) {
      const provider = await this.providersService.findByUserId(providerUserId);
      if (provider) {
        order.provider = provider;
        order.providerId = provider.id;

        // Generate Start OTP (4 digits distinct)
        order.startJobOtp = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }

    // If completing, ensure we don't just set completed without OTP (unless we want to allow bypass)
    // But verifyEndOtp handles strict flow. updateStatus is for generic updates.

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async verifyStartOtp(bookingId: string, otp: string) {
    const order = await this.ordersRepository.findOne({ where: { id: bookingId } });
    if (!order) throw new BadRequestException('Booking not found');

    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException('Booking must be accepted to start');
    }

    if (order.startJobOtp !== otp) {
      throw new BadRequestException('Invalid Start OTP');
    }

    // Move to IN_PROGRESS
    order.status = OrderStatus.IN_PROGRESS;
    // Generate End OTP
    order.endJobOtp = Math.floor(1000 + Math.random() * 9000).toString();

    return this.ordersRepository.save(order);
  }

  async verifyEndOtp(bookingId: string, otp: string) {
    const order = await this.ordersRepository.findOne({ where: { id: bookingId } });
    if (!order) throw new BadRequestException('Booking not found');

    if (order.status !== OrderStatus.IN_PROGRESS) {
      throw new BadRequestException('Booking must be in progress to complete');
    }

    if (order.endJobOtp !== otp) {
      throw new BadRequestException('Invalid End OTP');
    }

    // Move to COMPLETED
    order.status = OrderStatus.COMPLETED;

    // Credit Provider Balance
    if (order.providerId) {
      const provider = await this.providersService.findById(order.providerId);
      if (provider) {
        // Ensure numbers are treated as numbers (decimal often returns string in TypeORM)
        const amount = Number(order.priceFinal || order.priceEstimated || 0);
        const currentBalance = Number(provider.balance || 0);

        // Allow update of provider balance via ProvidersService? 
        // Better to do it here directly or expose method "creditBalance".
        // Since provider entity is simple, we can save it via provider repo if injected,
        // or just rely on providersService having a method.
        // Let's check imports. ProvidersService is imported.

        // We need a method in ProvidersService to update balance safely?
        // Or just update content if we can access repo? 
        // ProvidersService likely has repo access.

        await this.providersService.updateBalance(provider.id, currentBalance + amount);
      }
    }

    return this.ordersRepository.save(order);
  }
}

