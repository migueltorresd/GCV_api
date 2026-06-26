import { NotFoundException } from '@nestjs/common';
import { RechazarNovedadUseCase } from './rechazar-novedad.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';

const sergio: JwtPayload = { sub: 9, email: 's@x', rol: Rol.SUPERVISOR, filial_id: 1 };

function build(novedad: Novedad | null) {
  const repo = {
    findById: jest.fn().mockResolvedValue(novedad),
    guardar: jest.fn().mockImplementation((n: Novedad) => Promise.resolve(n)),
  };
  const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
  const useCase = new RechazarNovedadUseCase(
    repo as unknown as NovedadesRepository,
    auditoria as unknown as AuditoriaService,
  );
  return { useCase, repo, auditoria };
}

describe('RechazarNovedadUseCase', () => {
  it('PENDIENTE → RECHAZADA, guarda motivo y audita con detalle', async () => {
    const novedad = { id: 5, filialId: 1, estado: EstadoNovedad.PENDIENTE } as Novedad;
    const { useCase, auditoria } = build(novedad);

    const res = await useCase.execute(sergio, 5, 'Documentación incompleta');

    expect(res.estado).toBe(EstadoNovedad.RECHAZADA);
    expect(res.motivoRechazo).toBe('Documentación incompleta');
    expect(auditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: AuditoriaAccion.RECHAZAR,
        detalle: { motivo: 'Documentación incompleta' },
      }),
    );
  });

  it('novedad de otra filial → 404', async () => {
    const { useCase } = build({ id: 5, filialId: 2, estado: EstadoNovedad.PENDIENTE } as Novedad);
    await expect(useCase.execute(sergio, 5, 'x')).rejects.toThrow(NotFoundException);
  });
});
