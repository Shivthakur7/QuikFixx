import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'passwordHash',
        'fullName',
        'phoneNumber',
        'address',
        'createdAt',
      ], // Explicitly select passwordHash for auth
      relations: ['provider'],
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['provider'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    try {
      return await this.usersRepository.save(newUser);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Email or Phone number already exists');
      }
      throw error;
    }
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, attrs);
    return this.usersRepository.save(user);
  }
}
