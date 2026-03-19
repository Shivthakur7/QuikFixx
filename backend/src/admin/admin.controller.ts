import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard) // Protect all admin routes
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('kyc-pending')
  async getPendingKyc() {
    return this.adminService.getPendingKyc();
  }

  @Post('kyc/:providerId')
  async approveKyc(
      @Param('providerId') providerId: string,
      @Body('status') status: 'VERIFIED' | 'REJECTED'
  ) {
      return this.adminService.approveKyc(providerId, status);
  }
}
