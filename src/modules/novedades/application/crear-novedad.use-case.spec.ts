import { BadRequestException } from '@nestjs/common';
import { CrearNovedadUseCase } from './crear-novedad.use-case';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { TipoNovedad } from '../domain/novedad-tipo.enum';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';
import { CrearNovedadDto } from '../presentation/crear-novedad.dto';

const carla: JwtPayload = { sub: 1, email: 'carla@x', rol: Rol.COLABORADOR, filial_id: 1 };

describe('CrearNovedadUseCase', () => {
  function build() {
    const repo = { crear: jest.fn().mockImplementation((d: Partial<Novedad>) => Promise.resolve({ id: 1, ...d })) };
    const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
    const useCase = new CrearNovedadUseCase(
      repo as unknown as NovedadesRepository,
      auditoria as unknown as AuditoriaService,
    );
    return { useCase, repo, auditoria };
  }

  it('crea en BORRADOR con solicitante/filial del token (no del cliente) y audita CREAR', async () => {
    const { useCase, repo, auditoria } = build();
    const dto: CrearNovedadDto = { tipo: TipoNovedad.PERMISO, fecha_inicio: '2026-07-01' };

    await useCase.execute(carla, dto);

    expect(repo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: TipoNovedad.PERMISO,
        estado: EstadoNovedad.BORRADOR,
        solicitanteId: 1,
        filialId: 1,
      }),
    );
    expect(auditoria.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ accion: AuditoriaAccion.CREAR, entidad: 'novedad' }),
    );
  });

  it('fecha_fin anterior a fecha_inicio → 400 (no persiste)', async () => {
    const { useCase, repo } = build();
    const dto: CrearNovedadDto = {
      tipo: TipoNovedad.PERMISO,
      fecha_inicio: '2026-07-10',
      fecha_fin: '2026-07-01',
    };

    await expect(useCase.execute(carla, dto)).rejects.toThrow(BadRequestException);
    expect(repo.crear).not.toHaveBeenCalled();
  });
});
