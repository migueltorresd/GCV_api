import { ListarNovedadesUseCase } from './listar-novedades.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';

describe('ListarNovedadesUseCase (aplica scope antes de filtrar)', () => {
  function build() {
    const repo = { listar: jest.fn().mockResolvedValue([]) };
    const useCase = new ListarNovedadesUseCase(repo as unknown as NovedadesRepository);
    return { useCase, repo };
  }

  it('COLABORADOR: scope con filial Y solicitante propio', async () => {
    const { useCase, repo } = build();
    const user: JwtPayload = { sub: 1, email: 'c@x', rol: Rol.COLABORADOR, filial_id: 1 };

    await useCase.execute(user, { estado: undefined });

    expect(repo.listar).toHaveBeenCalledWith({ filialId: 1, solicitanteId: 1 }, { estado: undefined });
  });

  it('SUPERVISOR: scope solo por filial (ve toda su filial)', async () => {
    const { useCase, repo } = build();
    const user: JwtPayload = { sub: 9, email: 's@x', rol: Rol.SUPERVISOR, filial_id: 2 };

    await useCase.execute(user, {});

    expect(repo.listar).toHaveBeenCalledWith({ filialId: 2 }, {});
  });
});
