import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { UpdateRulesDto } from './dto/update-rules.dto';
import { BlacklistDto } from './dto/blacklist.dto';

@ApiTags('fraud')
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraud: FraudService) {}

  @Get('rules')
  getRules() {
    return this.fraud.getRules();
  }

  @Post('rules')
  updateRules(@Body() dto: UpdateRulesDto) {
    return this.fraud.updateRules(dto);
  }

  @Post('blacklist')
  addToBlacklist(@Body() dto: BlacklistDto) {
    return this.fraud.addToBlacklist(dto);
  }

  @Delete('blacklist/:subjectId')
  removeFromBlacklist(@Param('subjectId') subjectId: string) {
    return this.fraud.removeFromBlacklist(subjectId);
  }
}
