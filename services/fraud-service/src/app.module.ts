import { Module } from '@nestjs/common';
import { FraudModule } from './fraud/fraud.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, FraudModule]
})
export class AppModule {}
