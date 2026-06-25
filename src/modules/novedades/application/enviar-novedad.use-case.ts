import { Injectable, NotFoundException } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { validarTransicion } from '../domain/workflow.policy';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

@Injectable()
export class EnviarNovedadUseCase {
  constructor(
    private readonly repository: NovedadesRepository,
    private readonly auditoria: AuditoriaService,
  ) {}

  async execute(user: JwtPayload, id: number): Promise<Novedad> {
    const novedad = await this.repository.findById(id);

    // El colaborador solo puede enviar SUS propias novedades de SU filial.
    // No revelar existencia de recursos ajenos → 404.
    if (!novedad || novedad.filialId !== user.filial_id || novedad.solicitanteId !== user.sub) {
      throw new NotFoundException('Novedad no encontrada');
    }

    validarTransicion(novedad.estado, EstadoNovedad.PENDIENTE);
    novedad.estado = EstadoNovedad.PENDIENTE;
    const guardada = await this.repository.guardar(novedad);

    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.ENVIAR,
      entidad: 'novedad',
      entidadId: id,
    });

    return guardada;
  }
}
