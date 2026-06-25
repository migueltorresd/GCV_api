import { Injectable } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { puedeTransicionar } from '../domain/workflow.policy';
import { ContextoUsuario } from '../domain/visibilidad.policy';

export interface ResultadoMasivo {
  procesados: number[];
  ignorados: number[];
}

@Injectable()
export class AprobarMasivoUseCase {
  constructor(private readonly repository: NovedadesRepository) {}

  /**
   * Filter-and-skip: aprueba solo los IDs en PENDIENTE de la filial del supervisor.
   * El resto (no encontrados, de otra filial, o ya en estado final) se IGNORA — no lanza.
   * NO reutiliza AprobarNovedadUseCase porque ese lanza y rompería el batch entero.
   */
  async execute(user: ContextoUsuario, ids: number[]): Promise<ResultadoMasivo> {
    const candidatas = await this.repository.findByIdsEnFilial(ids, user.filial_id);
    const procesados: number[] = [];

    for (const novedad of candidatas) {
      if (puedeTransicionar(novedad.estado, EstadoNovedad.APROBADA)) {
        novedad.estado = EstadoNovedad.APROBADA;
        novedad.aprobadorId = user.sub;
        await this.repository.guardar(novedad);
        procesados.push(novedad.id);
      }
    }

    const ignorados = ids.filter((id) => !procesados.includes(id));
    return { procesados, ignorados };
  }
}
