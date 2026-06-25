import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protege endpoints: exige un Bearer JWT válido. Rechaza con 401 si falta o es inválido.
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
