import { NotFoundException } from '@nestjs/common';
import { EnviarNovedadUseCase } from './enviar-novedad.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { InvalidTransitionException } from '../domain/invalid-transition.exception';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';

const carla: JwtPayload = { sub: 1, email: 'carla@x', rol: Rol.COLABORADOR, filial_id: 1 };

function build(novedad: Novedad | null) {
  const repo = {
    findById: jest.fn().mockResolvedValue(novedad),
    guardar: jest.fn().mockImplementation((n: Novedad) => Promise.resolve(n)),
  };
  const useCase = new EnviarNovedadUseCase(
    repo as unknown as NovedadesRepository,
    { registrar: jest.fn() } as unknown as AuditoriaService,
  );
  return { useCase, repo };
}

describe('EnviarNovedadUseCase (ownership + transición)', () => {
  it('owner en su filial → BORRADOR pasa a PENDIENTE', async () => {
    const { useCase } = build({
      id: 5,
      filialId: 1,
      solicitanteId: 1,
      estado: EstadoNovedad.BORRADOR,
    } as Novedad);

    const res = await useCase.execute(carla, 5);

    expect(res.estado).toBe(EstadoNovedad.PENDIENTE);
  });

  it('novedad de otro colaborador → 404 (no revela existencia)', async () => {
    const { useCase } = build({
      id: 5,
      filialId: 1,
      solicitanteId: 99, // de otro usuario
      estado: EstadoNovedad.BORRADOR,
    } as Novedad);

    await expect(useCase.execute(carla, 5)).rejects.toThrow(NotFoundException);
  });

  it('novedad de otra filial → 404', async () => {
    const { useCase } = build({
      id: 5,
      filialId: 2, // otra filial
      solicitanteId: 1,
      estado: EstadoNovedad.BORRADOR,
    } as Novedad);

    await expect(useCase.execute(carla, 5)).rejects.toThrow(NotFoundException);
  });

  it('ya enviada (PENDIENTE) → transición inválida', async () => {
    const { useCase } = build({
      id: 5,
      filialId: 1,
      solicitanteId: 1,
      estado: EstadoNovedad.PENDIENTE,
    } as Novedad);

    await expect(useCase.execute(carla, 5)).rejects.toThrow(InvalidTransitionException);
  });
});
