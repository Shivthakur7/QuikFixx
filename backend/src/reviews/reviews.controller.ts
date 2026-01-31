import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: { userId: string };
}

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    async createReview(
        @Request() req: AuthenticatedRequest,
        @Body() body: { orderId: string; rating: number; comment?: string }
    ) {
        return this.reviewsService.create(req.user.userId, body);
    }

    @Get('provider/:providerId')
    async getProviderReviews(@Param('providerId') providerId: string) {
        return this.reviewsService.findByProvider(providerId);
    }
}
