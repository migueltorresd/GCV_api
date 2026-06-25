import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './domain/auditoria.entity';
import { AuditoriaRepository } from './infrastructure/auditoria.repository';
import { AuditoriaService } from './application/auditoria.service';
import { AuditoriaController } from './presentation/auditoria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria])],
  controllers: [AuditoriaController],
  providers: [AuditoriaRepository, AuditoriaService],
  exports: [AuditoriaService], // lo consumen los casos de uso de novedades
})
export class AuditoriaModule {}
