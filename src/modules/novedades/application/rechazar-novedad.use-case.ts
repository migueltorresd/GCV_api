import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import { ContextoUsuario } from '../domain/visibilidad.policy';

@Injectable()
export class RechazarNovedadUseCase {
  constructor(private readonly repository: NovedadesRepository) {}

  async execute(user: ContextoUsuario, id: number, motivo?: string): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    if (!novedad || novedad.filialId !== user.filial_id) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.RECHAZADA);
    novedad.estado = EstadoNovedad.RECHAZADA;
    novedad.aprobadorId = user.sub;
    novedad.motivoRechazo = motivo ?? null;
    return this.repository.guardar(novedad);
  }
}
