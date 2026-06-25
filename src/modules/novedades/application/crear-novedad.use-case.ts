import { BadRequestException, Injectable } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { CrearNovedadDto } from '../presentation/crear-novedad.dto';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

@Injectable()
export class CrearNovedadUseCase {
  constructor(
    private readonly repository: NovedadesRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  async execute(user: JwtPayload, dto: CrearNovedadDto): Promise<Novedad> {
    // Regla de negocio: la fecha de fin (si existe) no puede ser anterior a la de inicio.
    if (dto.fecha_fin && dto.fecha_fin < dto.fecha_inicio) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la de inicio');
    }

    // Estado inicial siempre BORRADOR; el solicitante y la filial salen del token (no del cliente).
    const novedad = await this.repository.crear({
      tipo: dto.tipo,
      fechaInicio: dto.fecha_inicio,
      fechaFin: dto.fecha_fin ?? null,
      descripcion: dto.descripcion ?? null,
      solicitanteId: user.sub,
      filialId: user.filial_id,
      estado: EstadoNovedad.BORRADOR,
    });

    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.CREAR,
      entidad: 'novedad',
      entidadId: novedad.id,
    });

    return novedad;
  }
}
