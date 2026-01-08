import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfers: TransfersService) {}

  @Post()
  create(
    @Body() dto: CreateTransferDto,
    @Headers('idempotency-key') idempotencyKey?: string
  ) {
    return this.transfers.createTransfer(dto, idempotencyKey || '');
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.transfers.getTransfer(id);
  }
}
