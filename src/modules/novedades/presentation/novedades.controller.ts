import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/presentation/jwt.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';
import { CrearNovedadUseCase } from '../application/crear-novedad.use-case';
import { ListarNovedadesUseCase } from '../application/listar-novedades.use-case';
import { EnviarNovedadUseCase } from '../application/enviar-novedad.use-case';
import { AprobarNovedadUseCase } from '../application/aprobar-novedad.use-case';
import { RechazarNovedadUseCase } from '../application/rechazar-novedad.use-case';
import {
  AprobarMasivoUseCase,
  ResultadoMasivo,
} from '../application/aprobar-masivo.use-case';
import { CrearNovedadDto } from './crear-novedad.dto';
import { FiltrosNovedadDto } from './filtros-novedad.dto';
import { RechazarNovedadDto } from './rechazar-novedad.dto';
import { AprobarMasivoDto } from './aprobar-masivo.dto';
import { NovedadResponseDto } from './novedad-response.dto';

@Controller('novedades')
@UseGuards(JwtGuard, RolesGuard) // 1º autentica (¿quién?), 2º autoriza por rol (¿puede?).
export class NovedadesController {
  constructor(
    private readonly crearNovedad: CrearNovedadUseCase,
    private readonly listarNovedades: ListarNovedadesUseCase,
    private readonly enviarNovedad: EnviarNovedadUseCase,
    private readonly aprobarNovedad: AprobarNovedadUseCase,
    private readonly rechazarNovedad: RechazarNovedadUseCase,
    private readonly aprobarMasivo: AprobarMasivoUseCase,
  ) {}

  @Post()
  @Roles(Rol.COLABORADOR)
  async crear(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CrearNovedadDto,
  ): Promise<NovedadResponseDto> {
    return NovedadResponseDto.from(await this.crearNovedad.execute(user, dto));
  }

  @Get()
  async listar(
    @CurrentUser() user: JwtPayload,
    @Query() filtros: FiltrosNovedadDto,
  ): Promise<NovedadResponseDto[]> {
    const novedades = await this.listarNovedades.execute(user, filtros);
    return novedades.map(NovedadResponseDto.from);
  }

  // Ruta literal declarada antes de las :id para evitar ambigüedad de routing.
  @Post('aprobar-masivo')
  @HttpCode(HttpStatus.OK)
  @Roles(Rol.SUPERVISOR)
  aprobarVarias(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AprobarMasivoDto,
  ): Promise<ResultadoMasivo> {
    return this.aprobarMasivo.execute(user, dto.ids);
  }

  @Post(':id/enviar')
  @HttpCode(HttpStatus.OK)
  @Roles(Rol.COLABORADOR)
  async enviar(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NovedadResponseDto> {
    return NovedadResponseDto.from(await this.enviarNovedad.execute(user, id));
  }

  @Post(':id/aprobar')
  @HttpCode(HttpStatus.OK)
  @Roles(Rol.SUPERVISOR)
  async aprobar(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NovedadResponseDto> {
    return NovedadResponseDto.from(await this.aprobarNovedad.execute(user, id));
  }

  @Post(':id/rechazar')
  @HttpCode(HttpStatus.OK)
  @Roles(Rol.SUPERVISOR)
  async rechazar(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarNovedadDto,
  ): Promise<NovedadResponseDto> {
    return NovedadResponseDto.from(await this.rechazarNovedad.execute(user, id, dto.motivo));
  }
}
