import 'reflect-metadata';
import './observability/otel';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PinoLogger } from './observability/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new PinoLogger()
  });

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('Notification delivery (mock)')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT || 3006);
  await app.listen(port);
}

void bootstrap();
