import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtPayload } from '../domain/jwt-payload.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<{ access_token: string }> {
    const usuario = await this.usersRepository.findByEmail(email);

    // Mensaje genérico: no revelar si el email existe o si la contraseña es la incorrecta.
    if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      filial_id: usuario.filialId,
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
