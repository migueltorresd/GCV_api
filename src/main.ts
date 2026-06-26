import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // [A05] Headers de seguridad.
  app.use(helmet());

  // [A05] CORS restringido: allowlist por env (coma-separada). Default al front de dev,
  // NUNCA un comodín que refleje cualquier origin.
  const origins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins });

  // [A03] Validación server-side global; descarta propiedades no declaradas.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
