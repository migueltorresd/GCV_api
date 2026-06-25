import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../users/domain/rol.enum';

export const ROLES_KEY = 'roles';

// Declara qué roles pueden acceder a un endpoint. Ej: @Roles(Rol.SUPERVISOR)
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
