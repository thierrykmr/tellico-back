import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());//pour analyser les cookies presents dans les requetes HTTP entrantes
    
    // Pour la securisation et validation automatique des DTOs (entrantes dans l'API) 
    app.useGlobalPipes(new ValidationPipe({
          transform: true,           // Transforme automatiquement les types (string vers number, etc.)
          disableErrorMessages: false, // Active les messages d'erreur détaillés
    }
      
    ))
    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.listen(process.env.PORT ?? 3009);
}
bootstrap();
