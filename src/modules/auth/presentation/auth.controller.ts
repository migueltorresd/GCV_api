import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginUseCase } from '../application/login.use-case';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // [A07] Anti fuerza bruta: 10 intentos por minuto por IP.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.loginUseCase.execute(dto.email, dto.password);
  }
}
