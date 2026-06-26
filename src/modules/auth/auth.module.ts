import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/login.use-case';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // [A02/A07] Sin default adivinable: si falta JWT_SECRET, la app NO arranca.
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET no está definido — requerido para firmar tokens.');
        }
        return {
          secret,
          // expiresIn acepta '8h' en runtime; el tipo de @nestjs/jwt 11 es estricto.
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
              '8h') as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtStrategy],
})
export class AuthModule {}
