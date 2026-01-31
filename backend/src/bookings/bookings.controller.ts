import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '@nestjs/passport';

import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: { userId: string };
}

@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingsController {
  constructor(private bookingsService: BookingsService) { }

  @Post()
  async createBooking(@Request() req: AuthenticatedRequest, @Body() body: any) {
    // Body: { serviceType: 'electrician', location: { lat, lng } }
    return this.bookingsService.createBooking(req.user.userId, body);
  }

  @Get('my')
  async getMyBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get('provider/requests')
  async getProviderRequests(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.findProviderBookings(req.user.userId);
  }

  @Post(':id/status')
  async updateBookingStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    // Basic validation could be improved (e.g. check enum values)
    return this.bookingsService.updateStatus(id, body.status as any, req.user.userId);
  }
}
