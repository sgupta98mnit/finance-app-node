import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BlacklistDto {
  @ApiProperty({ example: 'account-123' })
  @IsString()
  subjectId!: string;

  @ApiProperty({ example: 'manual block' })
  @IsString()
  reason!: string;
}
