import { LoggerService } from '@nestjs/common';
import pino from 'pino';

const serviceName = process.env.OTEL_SERVICE_NAME || 'gateway';
const logger = pino({
  name: serviceName,
  level: process.env.LOG_LEVEL || 'info'
});

export class PinoLogger implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    logger.info({ msg: message, extra: optionalParams });
  }

  error(message: any, ...optionalParams: any[]) {
    logger.error({ msg: message, extra: optionalParams });
  }

  warn(message: any, ...optionalParams: any[]) {
    logger.warn({ msg: message, extra: optionalParams });
  }

  debug(message: any, ...optionalParams: any[]) {
    logger.debug({ msg: message, extra: optionalParams });
  }

  verbose(message: any, ...optionalParams: any[]) {
    logger.trace({ msg: message, extra: optionalParams });
  }
}
