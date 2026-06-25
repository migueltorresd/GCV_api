import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

@Injectable()
export class RechazarNovedadUseCase {
  constructor(
    private readonly repository: NovedadesRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  async execute(user: JwtPayload, id: number, motivo?: string): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    if (!novedad || novedad.filialId !== user.filial_id) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.RECHAZADA);
    novedad.estado = EstadoNovedad.RECHAZADA;
    novedad.aprobadorId = user.sub;
    novedad.motivoRechazo = motivo ?? null;
    const guardada = await this.repository.guardar(novedad);

    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.RECHAZAR,
      entidad: 'novedad',
      entidadId: id,
      detalle: { motivo: motivo ?? null },
    });

    return guardada;
  }
}
