import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import { ContextoUsuario } from '../domain/visibilidad.policy';

@Injectable()
export class AprobarNovedadUseCase {
  constructor(private readonly repository: NovedadesRepository) {}

  async execute(user: ContextoUsuario, id: number): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    // El supervisor solo opera sobre novedades de SU filial.
    if (!novedad || novedad.filialId !== user.filial_id) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.APROBADA);
    novedad.estado = EstadoNovedad.APROBADA;
    novedad.aprobadorId = user.sub;
    return this.repository.guardar(novedad);
  }
}
