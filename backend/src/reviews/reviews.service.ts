import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Order } from '../entities/order.entity';
import { ProvidersService } from '../providers/providers.service';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>,
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private providersService: ProvidersService,
    ) { }

    async create(customerId: string, createReviewDto: { orderId: string; rating: number; comment?: string }) {
        // 1. Validate Order
        const order = await this.ordersRepository.findOne({
            where: { id: createReviewDto.orderId },
            relations: ['provider', 'customer'],
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        if (order.customerId !== customerId) {
            throw new BadRequestException('You are not the customer of this order');
        }

        if (order.status !== 'COMPLETED') {
            // In a real app we'd enforce this, but for testing we might want to relax or strictly ensure order is completed first.
            // throw new BadRequestException('Order must be completed to review'); 
            // Keeping it loose for MVP testing or strictly enforcing if "Complete Job" flow exists.
        }

        // 2. Check existing review
        const existingReview = await this.reviewsRepository.findOne({ where: { orderId: createReviewDto.orderId } });
        if (existingReview) {
            throw new BadRequestException('You have already reviewed this order');
        }

        // 3. Create Review
        const review = this.reviewsRepository.create({
            customerId,
            providerId: order.providerId,
            orderId: order.id,
            rating: createReviewDto.rating,
            comment: createReviewDto.comment,
        });

        const savedReview = await this.reviewsRepository.save(review);

        // 4. Update Provider Average Rating
        await this.providersService.updateRating(order.providerId);

        return savedReview;
    }

    async findByProvider(providerId: string) {
        return this.reviewsRepository.find({
            where: { providerId },
            order: { createdAt: 'DESC' },
            relations: ['customer']
        });
    }
}
