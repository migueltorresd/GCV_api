import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

@Injectable()
export class AprobarNovedadUseCase {
  constructor(
    private readonly repository: NovedadesRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  async execute(user: JwtPayload, id: number): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    // El supervisor solo opera sobre novedades de SU filial.
    if (!novedad || novedad.filialId !== user.filial_id) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.APROBADA);
    novedad.estado = EstadoNovedad.APROBADA;
    novedad.aprobadorId = user.sub;
    novedad.fechaAprobacion = new Date();
    const guardada = await this.repository.guardar(novedad);

    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.APROBAR,
      entidad: 'novedad',
      entidadId: id,
    });

    return guardada;
  }
}
