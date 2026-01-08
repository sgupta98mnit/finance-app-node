import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRulesDto {
  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxDailyAmount?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxTransfersPerMinute?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxBurstCount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  burstWindowMinutes?: number;
}
