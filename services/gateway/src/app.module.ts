import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AccountsProxyController } from './accounts/accounts.proxy.controller';
import { AuthProxyController } from './auth/auth.proxy.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { LedgerProxyController } from './ledger/ledger.proxy.controller';
import { TransfersProxyController } from './transfers/transfers.proxy.controller';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      global: true
    })
  ],
  controllers: [
    AppController,
    AuthProxyController,
    AccountsProxyController,
    LedgerProxyController,
    TransfersProxyController
  ],
  providers: [JwtAuthGuard, RolesGuard]
})
export class AppModule {}
