import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { LedgerQueryDto } from './dto/ledger-query.dto';

@ApiTags('ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Get('accounts/:accountId/entries')
  getEntries(@Param('accountId') accountId: string, @Query() query: LedgerQueryDto) {
    return this.ledger.getEntriesByAccount(accountId, query);
  }
}
