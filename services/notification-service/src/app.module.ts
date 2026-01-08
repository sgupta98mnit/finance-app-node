import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule]
})
export class AppModule {}
