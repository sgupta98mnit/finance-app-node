import 'reflect-metadata';
import './observability/otel';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PinoLogger } from './observability/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new PinoLogger()
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Ledger Service')
    .setDescription('Double-entry ledger API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT || 3003);
  await app.listen(port);
}

void bootstrap();
