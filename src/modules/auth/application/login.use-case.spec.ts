import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginUseCase } from './login.use-case';
import { Rol } from '../../users/domain/rol.enum';
import { Usuario } from '../../users/domain/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';

describe('LoginUseCase', () => {
  function build(usuario: Usuario | null) {
    const usersRepo = { findByEmail: jest.fn().mockResolvedValue(usuario) };
    const jwt = { signAsync: jest.fn().mockResolvedValue('TOKEN') };
    const useCase = new LoginUseCase(
      usersRepo as unknown as UsersRepository,
      jwt as unknown as JwtService,
    );
    return { useCase, usersRepo, jwt };
  }

  it('credenciales válidas → token con claims sub/email/rol/filial_id', async () => {
    const usuario = {
      id: 1,
      email: 'carla@and.gcv.com',
      passwordHash: await bcrypt.hash('Prueba2026*', 10),
      rol: Rol.COLABORADOR,
      filialId: 1,
    } as Usuario;
    const { useCase, jwt } = build(usuario);

    const res = await useCase.execute('carla@and.gcv.com', 'Prueba2026*');

    expect(res).toEqual({ access_token: 'TOKEN' });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 1,
      email: 'carla@and.gcv.com',
      rol: Rol.COLABORADOR,
      filial_id: 1,
    });
  });

  it('email inexistente → 401 (sin revelar cuál falló)', async () => {
    const { useCase } = build(null);
    await expect(useCase.execute('no@existe.com', 'x')).rejects.toThrow(UnauthorizedException);
  });

  it('password incorrecta → 401', async () => {
    const usuario = {
      id: 1,
      email: 'carla@and.gcv.com',
      passwordHash: await bcrypt.hash('correcta', 10),
      rol: Rol.COLABORADOR,
      filialId: 1,
    } as Usuario;
    const { useCase } = build(usuario);
    await expect(useCase.execute('carla@and.gcv.com', 'incorrecta')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
