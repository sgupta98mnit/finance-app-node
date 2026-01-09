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

  app.enableCors({
    origin: true,
    credentials: true
  });

  const config = new DocumentBuilder()
    .setTitle('Gateway')
    .setDescription('API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

void bootstrap();
