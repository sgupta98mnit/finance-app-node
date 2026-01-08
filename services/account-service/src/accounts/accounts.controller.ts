import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accounts.createAccount(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.accounts.getAccount(id);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.accounts.getBalance(id);
  }
}
