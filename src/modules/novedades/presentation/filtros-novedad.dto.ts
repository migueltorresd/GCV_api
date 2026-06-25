import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { TipoNovedad } from '../domain/novedad-tipo.enum';

// Query params de GET /novedades. Todos opcionales (Anexo C: ?tipo=&estado=&desde=&hasta=).
export class FiltrosNovedadDto {
  @IsOptional()
  @IsEnum(TipoNovedad)
  tipo?: TipoNovedad;

  @IsOptional()
  @IsEnum(EstadoNovedad)
  estado?: EstadoNovedad;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
