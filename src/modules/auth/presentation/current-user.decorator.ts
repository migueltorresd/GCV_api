import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../domain/jwt-payload.interface';

// Extrae el usuario autenticado (claims del JWT) inyectado por JwtStrategy en request.user.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
