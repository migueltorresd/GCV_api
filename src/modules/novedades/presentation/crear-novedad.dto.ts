import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoNovedad } from '../domain/novedad-tipo.enum';

// Entrada para POST /novedades. Nombres en snake_case para alinear con el contrato del front.
export class CrearNovedadDto {
  @IsEnum(TipoNovedad)
  tipo!: TipoNovedad;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  // Referencia del adjunto opcional (nombre o URL). Sin storage real.
  @IsOptional()
  @IsString()
  @MaxLength(255)
  adjunto?: string;
}
