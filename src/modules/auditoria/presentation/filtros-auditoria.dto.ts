import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AuditoriaAccion } from '../domain/auditoria-accion.enum';

// Query params de GET /auditoria (Anexo C: filtrable por empleado, acción y rango de fechas).
export class FiltrosAuditoriaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actor_id?: number;

  @IsOptional()
  @IsEnum(AuditoriaAccion)
  accion?: AuditoriaAccion;

  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
