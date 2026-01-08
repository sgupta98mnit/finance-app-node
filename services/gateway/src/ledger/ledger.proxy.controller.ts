import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ledger')
@ApiBearerAuth()
@Controller('ledger')
export class LedgerProxyController {
  constructor(private readonly http: HttpService) {}

  @UseGuards(JwtAuthGuard)
  @Get('accounts/:accountId/entries')
  async getEntries(@Param('accountId') accountId: string, @Query() query: Record<string, string>) {
    const response = await firstValueFrom(
      this.http.get(this.ledgerServiceUrl(`/ledger/accounts/${accountId}/entries`), {
        params: query
      })
    );
    return response.data;
  }

  private ledgerServiceUrl(path: string) {
    const base = process.env.LEDGER_SERVICE_URL || 'http://localhost:3003';
    return `${base}${path}`;
  }
}
