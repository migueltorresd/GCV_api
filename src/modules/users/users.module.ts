import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
