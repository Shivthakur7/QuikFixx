import { Controller, Patch, Put, Body, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Patch('profile')
    @Put('profile')
    async updateProfile(@Request() req: any, @Body() body: { fullName?: string; phoneNumber?: string; phone?: string; address?: string }) {
        // Support both phone and phoneNumber keys for backwards compatibility with different frontends
        const updateData = {
            fullName: body.fullName,
            phoneNumber: body.phoneNumber || body.phone,
            address: body.address
        };
        // Clean undefined keys
        Object.keys(updateData).forEach(key => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]);
        
        return this.usersService.update(req.user.userId, updateData);
    }
}
