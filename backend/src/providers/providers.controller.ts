import {
  Controller,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { AuthGuard } from '@nestjs/passport';

import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: { userId: string };
}

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(private providersService: ProvidersService) { }

  @Post('onboard')
  async onboard(@Request() req: AuthenticatedRequest, @Body() body: { skills: string[] }) {
    return this.providersService.createProvider(req.user.userId, body.skills);
  }

  @Patch('location')
  async updateLocation(
    @Request() req: AuthenticatedRequest,
    @Body() body: { lat: number; lng: number },
  ) {
    // req.user.userId is the User ID from JWT.
    // Provider definition: linked to User.
    return this.providersService.updateLocation(
      req.user.userId,
      body.lat,
      body.lng,
    );
  }

  @Post('status')
  async setStatus(@Request() req: AuthenticatedRequest, @Body() body: { isOnline: boolean }) {
    return this.providersService.setStatus(req.user.userId, body.isOnline);
  }
}
