import { Module } from '@nestjs/common';
import { LedgerModule } from './ledger/ledger.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, LedgerModule, MetricsModule]
})
export class AppModule {}
