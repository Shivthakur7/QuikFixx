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

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) { }

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
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
