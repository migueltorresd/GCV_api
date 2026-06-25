import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { Novedad } from './domain/novedad.entity';
import { NovedadesRepository } from './infrastructure/novedades.repository';
import { CrearNovedadUseCase } from './application/crear-novedad.use-case';
import { ListarNovedadesUseCase } from './application/listar-novedades.use-case';
import { EnviarNovedadUseCase } from './application/enviar-novedad.use-case';
import { AprobarNovedadUseCase } from './application/aprobar-novedad.use-case';
import { RechazarNovedadUseCase } from './application/rechazar-novedad.use-case';
import { AprobarMasivoUseCase } from './application/aprobar-masivo.use-case';
import { NovedadesController } from './presentation/novedades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad]), AuditoriaModule],
  controllers: [NovedadesController],
  providers: [
    NovedadesRepository,
    CrearNovedadUseCase,
    ListarNovedadesUseCase,
    EnviarNovedadUseCase,
    AprobarNovedadUseCase,
    RechazarNovedadUseCase,
    AprobarMasivoUseCase,
  ],
})
export class NovedadesModule {}
