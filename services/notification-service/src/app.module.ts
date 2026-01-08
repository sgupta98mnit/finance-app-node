import { Module } from '@nestjs/common';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule, MetricsModule]
})
export class AppModule {}
