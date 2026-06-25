import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RechazarNovedadDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}
