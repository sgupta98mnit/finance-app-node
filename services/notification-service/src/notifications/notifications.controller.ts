import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Query('limit') limit?: string) {
    const parsed = Number(limit ?? 50);
    return this.notifications.listLogs(Number.isNaN(parsed) ? 50 : parsed);
  }
}
