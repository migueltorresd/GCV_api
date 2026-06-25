import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Filial } from './filial.entity';
import { Rol } from './rol.enum';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150, unique: true })
  email!: string;

  // Nunca se expone en respuestas ni en el token. bcrypt hash.
  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ type: 'enum', enum: Rol })
  rol!: Rol;

  @Column({ name: 'filial_id' })
  filialId!: number;

  @ManyToOne(() => Filial)
  @JoinColumn({ name: 'filial_id' })
  filial!: Filial;

  // Supervisor asignado (Anexo A: supervisor_id nullable). El seed lo linkea por email.
  @Column({ name: 'supervisor_id', type: 'int', nullable: true })
  supervisorId!: number | null;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor!: Usuario | null;
}
