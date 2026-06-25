import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES } from './database/entities';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NovedadesModule } from './modules/novedades/novedades.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: ENTITIES,
        // Ver nota en data-source.ts: synchronize en dev, migrations en prod.
        synchronize: config.get<string>('DB_SYNCHRONIZE') !== 'false',
      }),
    }),
    UsersModule,
    AuthModule,
    NovedadesModule,
    AuditoriaModule,
  ],
})
export class AppModule {}
