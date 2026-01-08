import { Module } from '@nestjs/common';
import { FraudModule } from './fraud/fraud.module';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, FraudModule, MetricsModule]
})
export class AppModule {}
