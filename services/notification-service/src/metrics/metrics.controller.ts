import { Controller, Get, Header } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';

const registry = new Registry();
registry.setDefaultLabels({ service: process.env.OTEL_SERVICE_NAME || 'notification-service' });
collectDefaultMetrics({ register: registry });

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', registry.contentType)
  async getMetrics() {
    return registry.metrics();
  }
}
