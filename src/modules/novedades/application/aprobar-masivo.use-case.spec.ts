import { AprobarMasivoUseCase } from './aprobar-masivo.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';

const supervisor: JwtPayload = { sub: 9, email: 's@x', rol: Rol.SUPERVISOR, filial_id: 1 };

describe('AprobarMasivoUseCase (filter-and-skip)', () => {
  it('aprueba solo PENDIENTE, ignora ya-aprobadas y no encontradas', async () => {
    // La filial trae 1 (PENDIENTE) y 2 (APROBADA). El id 3 no existe en la filial.
    const candidatas = [
      { id: 1, estado: EstadoNovedad.PENDIENTE } as Novedad,
      { id: 2, estado: EstadoNovedad.APROBADA } as Novedad,
    ];
    const repo = {
      findByIdsEnFilial: jest.fn().mockResolvedValue(candidatas),
      guardar: jest.fn().mockImplementation((n: Novedad) => Promise.resolve(n)),
    };
    const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    const useCase = new AprobarMasivoUseCase(
      repo as unknown as NovedadesRepository,
      auditoria as unknown as AuditoriaService,
    );

    const res = await useCase.execute(supervisor, [1, 2, 3]);

    expect(res.procesados).toEqual([1]);
    expect(res.ignorados).toEqual([2, 3]);
    expect(repo.guardar).toHaveBeenCalledTimes(1); // solo la PENDIENTE
    expect(auditoria.registrar).toHaveBeenCalledTimes(1); // una entrada por la operación masiva
  });

  it('marca aprobador y estado APROBADA en las procesadas', async () => {
    const pendiente = { id: 1, estado: EstadoNovedad.PENDIENTE } as Novedad;
    const repo = {
      findByIdsEnFilial: jest.fn().mockResolvedValue([pendiente]),
      guardar: jest.fn().mockImplementation((n: Novedad) => Promise.resolve(n)),
    };
    const useCase = new AprobarMasivoUseCase(
      repo as unknown as NovedadesRepository,
      { registrar: jest.fn() } as unknown as AuditoriaService,
    );

    await useCase.execute(supervisor, [1]);

    expect(pendiente.estado).toBe(EstadoNovedad.APROBADA);
    expect(pendiente.aprobadorId).toBe(9);
  });
});
