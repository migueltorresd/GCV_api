import { NotFoundException } from '@nestjs/common';
import { AprobarNovedadUseCase } from './aprobar-novedad.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { InvalidTransitionException } from '../domain/invalid-transition.exception';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';

const sergio: JwtPayload = { sub: 9, email: 's@x', rol: Rol.SUPERVISOR, filial_id: 1 };

function build(novedad: Novedad | null) {
  const repo = {
    findById: jest.fn().mockResolvedValue(novedad),
    guardar: jest.fn().mockImplementation((n: Novedad) => Promise.resolve(n)),
  };
  const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
  const useCase = new AprobarNovedadUseCase(
    repo as unknown as NovedadesRepository,
    auditoria as unknown as AuditoriaService,
  );
  return { useCase, repo, auditoria };
}

describe('AprobarNovedadUseCase', () => {
  it('PENDIENTE → APROBADA, marca aprobador y fecha_aprobacion, audita', async () => {
    const novedad = { id: 5, filialId: 1, estado: EstadoNovedad.PENDIENTE } as Novedad;
    const { useCase, auditoria } = build(novedad);

    const res = await useCase.execute(sergio, 5);

    expect(res.estado).toBe(EstadoNovedad.APROBADA);
    expect(res.aprobadorId).toBe(9);
    expect(res.fechaAprobacion).toBeInstanceOf(Date);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
  });

  it('novedad de otra filial → 404', async () => {
    const { useCase } = build({ id: 5, filialId: 2, estado: EstadoNovedad.PENDIENTE } as Novedad);
    await expect(useCase.execute(sergio, 5)).rejects.toThrow(NotFoundException);
  });

  it('aprobar una BORRADOR → transición inválida', async () => {
    const { useCase } = build({ id: 5, filialId: 1, estado: EstadoNovedad.BORRADOR } as Novedad);
    await expect(useCase.execute(sergio, 5)).rejects.toThrow(InvalidTransitionException);
  });
});
