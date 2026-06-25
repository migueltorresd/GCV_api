import { IsDateString, IsOptional } from 'class-validator';

// Query params de GET /exportacion/csv. Nombres alineados con el cliente (fecha_desde/fecha_hasta).
export class ExportFiltrosDto {
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;
}
