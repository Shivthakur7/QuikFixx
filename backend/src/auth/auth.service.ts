import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

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
    console.log(`User ${user.email} logged in with role: ${role}`); // Direct console log for visibility
    const payload = { email: user.email, sub: user.id, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registrationDto: any) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(registrationDto.password, salt);

    const newUser = await this.usersService.create({
      ...registrationDto,
      passwordHash: hash,
    });

    // Automatically login after register
    return this.login(newUser);
  }
}
