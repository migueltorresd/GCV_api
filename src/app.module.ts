import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from './database/entities';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NovedadesModule } from './modules/novedades/novedades.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { ExportacionModule } from './modules/exportacion/exportacion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: ENTITIES,
        // [A05] Seguro por defecto: synchronize SOLO si DB_SYNCHRONIZE === 'true' (dev).
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    // [A07] Rate limiting global (100/min); el login lo restringe más con @Throttle.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    UsersModule,
    AuthModule,
    NovedadesModule,
    AuditoriaModule,
    ExportacionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
