import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;
}
