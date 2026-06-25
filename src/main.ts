import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: el frontend (Vite) corre en otro origen (p. ej. http://localhost:5173).
  // En dev se refleja el origin de la request; en prod se restringe vía CORS_ORIGIN.
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? true });

  // Validación server-side global (RT-10): descarta propiedades no declaradas en los DTOs.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
