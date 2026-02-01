import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) { }

  @Post('send-otp')
  async sendOtp(@Body() body: { phoneNumber: string }) {
    return this.authService.sendOtp(body.phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phoneNumber: string; code: string }) {
    const isValid = await this.authService.verifyOtp(body.phoneNumber, body.code);
    return { success: isValid };
  }

  @Post('login-otp')
  async loginOtp(@Body() body: { phoneNumber: string; code: string }) {
    await this.authService.verifyOtp(body.phoneNumber, body.code);

    // Find user by phone
    const user = await this.usersService.findOneByPhone(body.phoneNumber);

    if (!user) {
      throw new UnauthorizedException('User not found. Please register first.');
    }

    return this.authService.login(user);
  }

  @Post('login')
  async login(@Body() req) {
    this.logger.log(`Login attempt for: ${req.email}`);
    // In a real app, use LocalAuthGuard to validate credentials first
    // Here we assume body has { email, password }
    const validUser = await this.authService.validateUser(
      req.email,
      req.password,
    );
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(validUser);
  }

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    // req.user has { userId, email } from JWT payload
    // We fetch fresh data from DB including Provider relation
    return this.usersService.findOneById(req.user.userId);
  }
}
