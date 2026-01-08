import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsProxyController {
  constructor(private readonly http: HttpService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: unknown) {
    const response = await firstValueFrom(
      this.http.post(this.accountServiceUrl('/accounts'), body)
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.http.get(this.accountServiceUrl(`/accounts/${id}`))
    );
    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    const response = await firstValueFrom(
      this.http.get(this.accountServiceUrl(`/accounts/${id}/balance`))
    );
    return response.data;
  }

  private accountServiceUrl(path: string) {
    const base = process.env.ACCOUNT_SERVICE_URL || 'http://localhost:3002';
    return `${base}${path}`;
  }
}
