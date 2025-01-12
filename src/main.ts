import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('shopping-cart API')
    .setDescription('simulate a basic ecommerce shopping-cart API')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-management-swagger', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
