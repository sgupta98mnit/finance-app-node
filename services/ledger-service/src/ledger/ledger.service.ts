import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerQueryDto } from './dto/ledger-query.dto';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getEntriesByAccount(accountId: string, query: LedgerQueryDto) {
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    const entries = await this.prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    return entries.map((entry) => ({
      id: entry.id,
      transactionId: entry.transactionId,
      accountId: entry.accountId,
      direction: entry.direction,
      amount: entry.amount.toString(),
      currency: entry.currency,
      createdAt: entry.createdAt.toISOString()
    }));
  }
}
