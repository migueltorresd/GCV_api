import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditoriaAccion } from './auditoria-accion.enum';

// Registro inmutable de acciones críticas. Se escribe pero nunca se actualiza ni borra.
@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'actor_id' })
  actorId!: number;

  // Desnormalizado: preserva la trazabilidad histórica aunque el usuario cambie luego.
  @Column({ name: 'actor_email', length: 150 })
  actorEmail!: string;

  @Column({ type: 'enum', enum: AuditoriaAccion })
  accion!: AuditoriaAccion;

  @Column({ length: 50 })
  entidad!: string;

  @Column({ name: 'entidad_id', type: 'varchar', nullable: true })
  entidadId!: string | null;

  @Column({ name: 'filial_id' })
  filialId!: number;

  // Contexto adicional: motivo de rechazo, IDs procesados/ignorados en masivo, etc.
  @Column({ type: 'jsonb', nullable: true })
  detalle!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp!: Date;
}
