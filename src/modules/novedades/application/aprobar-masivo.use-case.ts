import { Injectable } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { puedeTransicionar } from '../domain/workflow.policy';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

export interface ResultadoMasivo {
  procesados: number[];
  ignorados: number[];
}

@Injectable()
export class AprobarMasivoUseCase {
  constructor(
    private readonly repository: NovedadesRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  /**
   * Filter-and-skip: aprueba solo los IDs en PENDIENTE de la filial del supervisor.
   * El resto (no encontrados, de otra filial, o ya en estado final) se IGNORA — no lanza.
   * NO reutiliza AprobarNovedadUseCase porque ese lanza y rompería el batch entero.
   */
  async execute(user: JwtPayload, ids: number[]): Promise<ResultadoMasivo> {
    const candidatas = await this.repository.findByIdsEnFilial(ids, user.filial_id);
    const procesados: number[] = [];

    for (const novedad of candidatas) {
      if (puedeTransicionar(novedad.estado, EstadoNovedad.APROBADA)) {
        novedad.estado = EstadoNovedad.APROBADA;
        novedad.aprobadorId = user.sub;
        novedad.fechaAprobacion = new Date();
        await this.repository.guardar(novedad);
        procesados.push(novedad.id);
      }
    }

    const ignorados = ids.filter((id) => !procesados.includes(id));

    // Una entrada de auditoría por la operación masiva, con el detalle de IDs.
    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.APROBAR,
      entidad: 'novedad',
      entidadId: null,
      detalle: { masivo: true, procesados, ignorados },
    });

    return { procesados, ignorados };
  }
}
