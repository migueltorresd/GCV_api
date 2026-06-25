import { Injectable } from '@nestjs/common';
import { NovedadesRepository } from '../infrastructure/novedades.repository';
import { Novedad } from '../domain/novedad.entity';
import { ContextoUsuario, scopeVisibilidadNovedades } from '../domain/visibilidad.policy';
import { FiltrosNovedadDto } from '../presentation/filtros-novedad.dto';

@Injectable()
export class ListarNovedadesUseCase {
  constructor(private readonly repository: NovedadesRepository) {}

  execute(user: ContextoUsuario, filtros: FiltrosNovedadDto): Promise<Novedad[]> {
    // La regla de visibilidad (multi-tenant + RBAC intra-filial) se aplica SIEMPRE,
    // antes que cualquier filtro del cliente. Acá se cierra el aislamiento en backend.
    const scope = scopeVisibilidadNovedades(user);
    return this.repository.listar(scope, filtros);
  }
}
