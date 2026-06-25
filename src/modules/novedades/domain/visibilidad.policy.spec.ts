import { Rol } from '../../users/domain/rol.enum';
import { scopeVisibilidadNovedades } from './visibilidad.policy';

describe('scopeVisibilidadNovedades (aislamiento multi-tenant + RBAC intra-filial)', () => {
  it('COLABORADOR: acotado a su filial Y a sus propias novedades', () => {
    const scope = scopeVisibilidadNovedades({ sub: 1, rol: Rol.COLABORADOR, filial_id: 1 });
    expect(scope).toEqual({ filialId: 1, solicitanteId: 1 });
  });

  it('SUPERVISOR: ve todas las de su filial, sin restricción de propietario', () => {
    const scope = scopeVisibilidadNovedades({ sub: 2, rol: Rol.SUPERVISOR, filial_id: 1 });
    expect(scope).toEqual({ filialId: 1 });
    expect(scope.solicitanteId).toBeUndefined();
  });

  it('RRHH: ve todas las de su filial, sin restricción de propietario', () => {
    const scope = scopeVisibilidadNovedades({ sub: 3, rol: Rol.RRHH, filial_id: 2 });
    expect(scope).toEqual({ filialId: 2 });
    expect(scope.solicitanteId).toBeUndefined();
  });

  it('el scope SIEMPRE refleja la filial del usuario (nunca otra)', () => {
    const filialA = scopeVisibilidadNovedades({ sub: 1, rol: Rol.COLABORADOR, filial_id: 1 });
    const filialB = scopeVisibilidadNovedades({ sub: 4, rol: Rol.COLABORADOR, filial_id: 2 });
    expect(filialA.filialId).toBe(1);
    expect(filialB.filialId).toBe(2);
  });

  it('dos colaboradores de la misma filial obtienen scope de propietario distinto', () => {
    const carla = scopeVisibilidadNovedades({ sub: 1, rol: Rol.COLABORADOR, filial_id: 1 });
    const otro = scopeVisibilidadNovedades({ sub: 99, rol: Rol.COLABORADOR, filial_id: 1 });
    expect(carla.solicitanteId).toBe(1);
    expect(otro.solicitanteId).toBe(99);
    // Misma filial, pero cada uno solo ve lo suyo.
    expect(carla.solicitanteId).not.toBe(otro.solicitanteId);
  });
});
