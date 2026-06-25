import { Rol } from '../../users/domain/rol.enum';

// Contexto de seguridad del usuario autenticado (claims del JWT).
export interface ContextoUsuario {
  sub: number;
  rol: Rol;
  filial_id: number;
}

// Filtro de scope que toda query de novedades debe aplicar.
export interface ScopeNovedades {
  filialId: number;
  solicitanteId?: number;
}

/**
 * Regla de visibilidad — núcleo del aislamiento multi-tenant + RBAC intra-filial.
 *
 * - Todos los roles quedan acotados a SU filial (RT-03): nunca ven otra filial.
 * - COLABORADOR, además, solo ve novedades propias (solicitante_id = su id).
 * - SUPERVISOR / RRHH ven todas las de su filial.
 *
 * Función pura y sin dependencias → testeable de forma aislada (objetivo Fase 10).
 */
export function scopeVisibilidadNovedades(user: ContextoUsuario): ScopeNovedades {
  const scope: ScopeNovedades = { filialId: user.filial_id };

  if (user.rol === Rol.COLABORADOR) {
    scope.solicitanteId = user.sub;
  }

  return scope;
}
