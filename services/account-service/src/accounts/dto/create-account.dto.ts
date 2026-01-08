import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum AccountTypeInput {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS'
}

export class CreateAccountDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  userId!: string;

  @ApiProperty({ enum: AccountTypeInput })
  @IsEnum(AccountTypeInput)
  type!: AccountTypeInput;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;
}
