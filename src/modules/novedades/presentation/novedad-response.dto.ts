import { Novedad } from '../domain/novedad.entity';
import { EstadoNovedad } from '../domain/novedad-estado.enum';
import { TipoNovedad } from '../domain/novedad-tipo.enum';

// Salida controlada hacia el cliente. snake_case para el front; mapea solo lo necesario.
export class NovedadResponseDto {
  id!: number;
  tipo!: TipoNovedad;
  estado!: EstadoNovedad;
  fecha_inicio!: string;
  fecha_fin!: string | null;
  descripcion!: string | null;
  solicitante_id!: number;
  filial_id!: number;
  aprobador_id!: number | null;
  motivo_rechazo!: string | null;
  created_at!: Date;

  static from(n: Novedad): NovedadResponseDto {
    return {
      id: n.id,
      tipo: n.tipo,
      estado: n.estado,
      fecha_inicio: n.fechaInicio,
      fecha_fin: n.fechaFin,
      descripcion: n.descripcion,
      solicitante_id: n.solicitanteId,
      filial_id: n.filialId,
      aprobador_id: n.aprobadorId,
      motivo_rechazo: n.motivoRechazo,
      created_at: n.createdAt,
    };
  }
}
