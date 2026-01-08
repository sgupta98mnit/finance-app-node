import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleInput {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'strongpassword' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: RoleInput, required: false })
  @IsOptional()
  @IsEnum(RoleInput)
  role?: RoleInput;
}
