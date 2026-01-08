import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transfers')
@ApiBearerAuth()
@Controller('transfers')
export class TransfersProxyController {
  constructor(private readonly http: HttpService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: unknown, @Headers('idempotency-key') idempotencyKey?: string) {
    const response = await firstValueFrom(
      this.http.post(this.transactionServiceUrl('/transfers'), body, {
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
      })
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.http.get(this.transactionServiceUrl(`/transfers/${id}`))
    );
    return response.data;
  }

  private transactionServiceUrl(path: string) {
    const base = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3004';
    return `${base}${path}`;
  }
}
