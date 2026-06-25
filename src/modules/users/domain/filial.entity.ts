import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('filial')
export class Filial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 20, unique: true })
  codigo!: string;
}
