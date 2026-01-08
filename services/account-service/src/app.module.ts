import { Module } from '@nestjs/common';
import { AccountsModule } from './accounts/accounts.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AccountsModule, MetricsModule]
})
export class AppModule {}
