import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { version } from '../package.json';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(morgan('dev'));
  //if (process.env.NODE_ENV === 'development') {
  const options = new DocumentBuilder()
    .setTitle('Yggdrasil API')
    .setDescription('The Yggdrasil API documentation')
    .setVersion(version)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  // }
  await app.listen(3000);
}
bootstrap();
