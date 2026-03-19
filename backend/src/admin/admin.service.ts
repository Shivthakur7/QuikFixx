import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { Order, OrderStatus } from '../entities/order.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Provider) private providersRepo: Repository<Provider>,
    @InjectRepository(Order) private ordersRepo: Repository<Order>
  ) {}

  async getPlatformStats() {
    const totalUsers = await this.usersRepo.count();
    const totalProviders = await this.providersRepo.count();
    
    // Total jobs and revenue
    // We'll calculate revenue based on COMPLETED orders using priceFinal (or priceEstimated as fallback)
    const completedOrders = await this.ordersRepo.find({ where: { status: OrderStatus.COMPLETED } });
    const totalJobs = completedOrders.length;
    
    let totalRevenue = 0;
    completedOrders.forEach(order => {
        totalRevenue += Number(order.priceFinal || order.priceEstimated || 0);
    });

    // Assume platform takes a 10% commission for simplicity in stats (optional)
    const platformRevenue = totalRevenue * 0.10;

    return {
      totalUsers,
      totalProviders,
      totalJobs,
      totalRevenue,
      platformRevenue
    };
  }

  async getPendingKyc() {
      return this.providersRepo.find({
          where: { verificationStatus: 'PENDING' },
          relations: ['user']
      });
  }

  async approveKyc(providerId: string, status: 'VERIFIED' | 'REJECTED') {
      await this.providersRepo.update(providerId, { verificationStatus: status });
      return { success: true, message: `Provider KYC ${status}` };
  }
}
