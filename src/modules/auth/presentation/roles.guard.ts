import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';
import { ROLES_KEY } from './roles.decorator';

// Autoriza por rol. Se usa junto a JwtGuard (que ya pobló request.user).
// Si el endpoint no declara @Roles, no restringe. Sin rol permitido → 403.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const { user } = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    return !!user && required.includes(user.rol);
  }
}
