import { Injectable } from '@nestjs/common';
import { AuditoriaRepository } from '../infrastructure/auditoria.repository';
import { AuditoriaAccion } from '../domain/auditoria-accion.enum';

// Actor de la acción (subconjunto de los claims del JWT).
export interface ActorAuditoria {
  sub: number;
  email: string;
  filial_id: number;
}

export interface RegistrarAuditoria {
  actor: ActorAuditoria;
  accion: AuditoriaAccion;
  entidad: string;
  entidadId?: number | string | null;
  detalle?: Record<string, unknown> | null;
}

// Punto único de registro de acciones críticas. Se invoca desde los casos de uso,
// nunca desde los controllers (evita auditoría dispersa y frágil).
@Injectable()
export class AuditoriaService {
  constructor(private readonly repository: AuditoriaRepository) {}

  async registrar(input: RegistrarAuditoria): Promise<void> {
    await this.repository.guardar({
      actorId: input.actor.sub,
      actorEmail: input.actor.email,
      filialId: input.actor.filial_id,
      accion: input.accion,
      entidad: input.entidad,
      entidadId: input.entidadId != null ? String(input.entidadId) : null,
      detalle: input.detalle ?? null,
    });
  }
}
