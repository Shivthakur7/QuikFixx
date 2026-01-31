import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../entities/review.entity';
import { Order } from '../entities/order.entity';
import { ProvidersModule } from '../providers/providers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Order]),
        ProvidersModule,
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule { }
