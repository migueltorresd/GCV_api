import { Filial } from '../modules/users/domain/filial.entity';
import { Usuario } from '../modules/users/domain/user.entity';
import { Novedad } from '../modules/novedades/domain/novedad.entity';
import { Auditoria } from '../modules/auditoria/domain/auditoria.entity';

// Fuente única de entidades. La usan AppModule (runtime) y el DataSource del seed.
export const ENTITIES = [Filial, Usuario, Novedad, Auditoria];
