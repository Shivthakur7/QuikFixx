import { Controller, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() body: { address?: string }) {
        return this.usersService.update(req.user.userId, body);
    }
}
