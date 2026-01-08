import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [PrismaModule, TransfersModule]
})
export class AppModule {}
