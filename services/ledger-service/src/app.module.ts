import { Module } from '@nestjs/common';
import { LedgerModule } from './ledger/ledger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, LedgerModule]
})
export class AppModule {}
