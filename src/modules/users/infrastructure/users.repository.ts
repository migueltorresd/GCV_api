import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
  ) {}

  findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number): Promise<Usuario | null> {
    return this.repo.findOne({ where: { id } });
  }
}
