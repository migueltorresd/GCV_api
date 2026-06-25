import { Rol } from '../../users/domain/rol.enum';

// Claims mínimos del JWT (Anexo C / RT-01).
export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
  filial_id: number;
}
