import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());//pour analyser les cookies presents dans les requetes HTTP entrantes
  
  // Pour la securisation et validation automatique des DTOs (entrantes dans l'API) 
  app.useGlobalPipes(new ValidationPipe())
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  await app.listen(process.env.PORT ?? 3009);
}
bootstrap();
