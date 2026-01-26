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
}
