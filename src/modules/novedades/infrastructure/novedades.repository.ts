import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Novedad } from '../domain/novedad.entity';
import { ScopeNovedades } from '../domain/visibilidad.policy';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { TipoNovedad } from '../domain/novedad-tipo.enum';

interface FiltrosListado {
  tipo?: TipoNovedad;
  estado?: EstadoNovedad;
  desde?: string;
  hasta?: string;
}

@Injectable()
export class NovedadesRepository {
  constructor(
    @InjectRepository(Novedad) private readonly repo: Repository<Novedad>,
  ) {}

  crear(data: Partial<Novedad>): Promise<Novedad> {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: number): Promise<Novedad | null> {
    return this.repo.findOne({ where: { id } });
  }

  // Carga solo las novedades de la filial indicada (scoping de la aprobación masiva).
  findByIdsEnFilial(ids: number[], filialId: number): Promise<Novedad[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.repo.find({ where: { id: In(ids), filialId } });
  }

  guardar(novedad: Novedad): Promise<Novedad> {
    return this.repo.save(novedad);
  }

  // Novedades APROBADAS de la filial en un rango (para exportación Anexo E).
  // Carga relaciones para resolver email del solicitante/aprobador y código de filial.
  findAprobadas(filialId: number, desde?: string, hasta?: string): Promise<Novedad[]> {
    const where: FindOptionsWhere<Novedad> = {
      filialId,
      estado: EstadoNovedad.APROBADA,
    };

    if (desde && hasta) {
      where.fechaInicio = Between(desde, hasta);
    } else if (desde) {
      where.fechaInicio = MoreThanOrEqual(desde);
    } else if (hasta) {
      where.fechaInicio = LessThanOrEqual(hasta);
    }

    return this.repo.find({
      where,
      relations: { solicitante: true, aprobador: true, filial: true },
      order: { fechaInicio: 'ASC' },
    });
  }

  /**
   * Listado con scope de seguridad SIEMPRE aplicado.
   * `scope` viene de scopeVisibilidadNovedades → garantiza filial (y propietario si es Colaborador).
   * Los filtros son opcionales y se suman al scope, nunca lo reemplazan.
   */
  listar(scope: ScopeNovedades, filtros: FiltrosListado): Promise<Novedad[]> {
    const where: FindOptionsWhere<Novedad> = { filialId: scope.filialId };

    if (scope.solicitanteId !== undefined) {
      where.solicitanteId = scope.solicitanteId;
    }
    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }
    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Rango de fechas sobre fecha_inicio (supuesto documentado).
    if (filtros.desde && filtros.hasta) {
      where.fechaInicio = Between(filtros.desde, filtros.hasta);
    } else if (filtros.desde) {
      where.fechaInicio = MoreThanOrEqual(filtros.desde);
    } else if (filtros.hasta) {
      where.fechaInicio = LessThanOrEqual(filtros.hasta);
    }

    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }
}
