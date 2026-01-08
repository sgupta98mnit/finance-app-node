import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferDto {
  @ApiProperty({ example: 'account-1' })
  @IsString()
  fromAccountId!: string;

  @ApiProperty({ example: 'account-2' })
  @IsString()
  toAccountId!: string;

  @ApiProperty({ example: 125.5 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency!: string;
}
