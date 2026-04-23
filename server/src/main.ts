import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe());

   app.enableCors({
    origin: process.env.FRONTEND_LINK, // 👈 your Next.js frontend
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();