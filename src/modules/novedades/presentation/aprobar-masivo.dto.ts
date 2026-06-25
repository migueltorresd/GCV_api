import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AprobarMasivoDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids!: number[];
}
