import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Auditoria } from '../domain/auditoria.entity';
import { AuditoriaAccion } from '../domain/auditoria-accion.enum';

export interface FiltrosAuditoria {
  actor_id?: number;
  accion?: AuditoriaAccion;
  entidad?: string;
  desde?: string;
  hasta?: string;
}

@Injectable()
export class AuditoriaRepository {
  constructor(
    @InjectRepository(Auditoria) private readonly repo: Repository<Auditoria>,
  ) {}

  guardar(data: Partial<Auditoria>): Promise<Auditoria> {
    return this.repo.save(this.repo.create(data));
  }

  // Siempre scopeado por filial. Los filtros son opcionales y se suman al scope.
  findWithFilters(filialId: number, filtros: FiltrosAuditoria): Promise<Auditoria[]> {
    const where: FindOptionsWhere<Auditoria> = { filialId };

    if (filtros.actor_id !== undefined) {
      where.actorId = filtros.actor_id;
    }
    if (filtros.accion) {
      where.accion = filtros.accion;
    }
    if (filtros.entidad) {
      where.entidad = filtros.entidad;
    }
    if (filtros.desde && filtros.hasta) {
      where.timestamp = Between(new Date(filtros.desde), new Date(filtros.hasta));
    } else if (filtros.desde) {
      where.timestamp = MoreThanOrEqual(new Date(filtros.desde));
    } else if (filtros.hasta) {
      where.timestamp = LessThanOrEqual(new Date(filtros.hasta));
    }

    return this.repo.find({ where, order: { timestamp: 'DESC' } });
  }
}
