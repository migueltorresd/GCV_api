import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import { ContextoUsuario } from '../domain/visibilidad.policy';

@Injectable()
export class EnviarNovedadUseCase {
  constructor(private readonly repository: NovedadesRepository) {}

  async execute(user: ContextoUsuario, id: number): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    // El colaborador solo puede enviar SUS propias novedades de SU filial.
    // No revelar existencia de recursos ajenos → 404.
    if (!novedad || novedad.filialId !== user.filial_id || novedad.solicitanteId !== user.sub) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.PENDIENTE);
    novedad.estado = EstadoNovedad.PENDIENTE;
    return this.repository.guardar(novedad);
  }
}
