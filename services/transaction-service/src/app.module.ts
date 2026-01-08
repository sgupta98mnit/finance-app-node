import { Module } from '@nestjs/common';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [PrismaModule, TransfersModule, MetricsModule]
})
export class AppModule {}
