import {
  Controller,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
    @Body() body: { lat: number; lng: number; address?: string },
  ) {
    // req.user.userId is the User ID from JWT.
    // Provider definition: linked to User.
    return this.providersService.updateLocation(
      req.user.userId,
      body.lat,
      body.lng,
      body.address,
    );
  }

  @Post('upload-verification')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadVerification(@Request() req: AuthenticatedRequest, @UploadedFile() file: any) {
    return this.providersService.submitVerification(req.user.userId, file.filename);
  }

  @Post('status')
  async setStatus(@Request() req: AuthenticatedRequest, @Body() body: { isOnline: boolean }) {
    return this.providersService.setStatus(req.user.userId, body.isOnline);
  }

  @Post('search')
  async search(@Body() body: { lat: number; lng: number; serviceType: string }) {
    return this.providersService.searchProviders(body.lat, body.lng, body.serviceType);
  }
}
