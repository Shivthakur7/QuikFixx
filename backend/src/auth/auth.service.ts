import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from '../redis/redis.service';
import { Twilio } from 'twilio';

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const role = user.provider ? 'provider' : 'customer';
    console.log(`User ${user.email} logged in with role: ${role}`);
    const payload = { email: user.email, sub: user.id, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registrationDto: any) {
    // Check if user already exists
    const existing = await this.usersService.findOneByEmail(registrationDto.email);
    if (existing) throw new BadRequestException('Email already exists');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(registrationDto.password, salt);

    const newUser = await this.usersService.create({
      ...registrationDto,
      passwordHash: hash,
    });

    return this.login(newUser);
  }

  // OTP Logic
  async sendOtp(phoneNumber: string) {
    // Basic E.164 formatting: If 10 digits, add +91 (assuming India context as default)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        // Try adding + if user typed 9198765...
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to Redis (expires in 5 mins)
    // Use original input or formatted? Better to use formatted for consistency.
    await this.redisService.set(`OTP:${formattedPhone}`, otp, 300);

    // Send via Twilio
    if (this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: `Your QuikFixx verification code is ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
        return { success: true, message: 'OTP sent via SMS' };
      } catch (error) {
        console.error('Twilio Error:', error);
        // Fallback for dev if Twilio fails (e.g. unverified number in trial)
        return { success: true, message: `OTP sent (Twilio Failed): ${otp}` };
      }
    } else {
      console.log(`[MOCK OTP] For ${formattedPhone}: ${otp}`);
      return { success: true, message: 'OTP sent (Mock)' };
    }
  }

  async verifyOtp(phoneNumber: string, code: string) {
    // Ensure we verify against the same formatted number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    const storedOtp = await this.redisService.get(`OTP:${formattedPhone}`);
    if (!storedOtp) throw new BadRequestException('OTP expired or not found');
    if (storedOtp !== code) throw new BadRequestException('Invalid OTP');

    // Clear OTP after success
    await this.redisService.del(`OTP:${formattedPhone}`);
    return true;
  }
}
