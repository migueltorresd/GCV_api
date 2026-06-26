import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Filial } from '../../users/domain/filial.entity';
import { Usuario } from '../../users/domain/user.entity';
import { EstadoNovedad } from './novedad-estado.enum';
import { TipoNovedad } from './novedad-tipo.enum';

@Entity('novedad')
export class Novedad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: TipoNovedad })
  tipo!: TipoNovedad;

  @Column({ type: 'enum', enum: EstadoNovedad, default: EstadoNovedad.BORRADOR })
  estado!: EstadoNovedad;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  // Nullable: tipos como ACTUALIZACION_DATOS no tienen fecha de fin natural (Anexo A).
  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  // Adjunto opcional (RT-04): se guarda solo la referencia (nombre/URL).
  // El almacenamiento real de archivos es SHOULD/COULD, fuera de alcance.
  @Column({ type: 'varchar', length: 255, nullable: true })
  adjunto!: string | null;

  @Column({ name: 'solicitante_id' })
  solicitanteId!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'solicitante_id' })
  solicitante!: Usuario;

  // Desnormalizado para scoping multi-tenant rápido; siempre presente.
  @Column({ name: 'filial_id' })
  filialId!: number;

  @ManyToOne(() => Filial)
  @JoinColumn({ name: 'filial_id' })
  filial!: Filial;

  @Column({ name: 'aprobador_id', type: 'int', nullable: true })
  aprobadorId!: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'aprobador_id' })
  aprobador!: Usuario | null;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo!: string | null;

  // Fecha de aprobación — requerida por el Anexo E (CSV). Se setea al aprobar.
  @Column({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true })
  fechaAprobacion!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
