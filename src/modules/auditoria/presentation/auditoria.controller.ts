import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/presentation/jwt.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';
import { Auditoria } from '../domain/auditoria.entity';
import { AuditoriaRepository } from '../infrastructure/auditoria.repository';
import { FiltrosAuditoriaDto } from './filtros-auditoria.dto';

@Controller('auditoria')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Rol.RRHH) // Solo RR.HH. consulta el log; el resto recibe 403.
export class AuditoriaController {
  constructor(private readonly repository: AuditoriaRepository) {}

  @Get()
  listar(
    @CurrentUser() user: JwtPayload,
    @Query() filtros: FiltrosAuditoriaDto,
  ): Promise<Auditoria[]> {
    // Scope por la filial del token: RR.HH. nunca ve auditoría de otra filial.
    return this.repository.findWithFilters(user.filial_id, filtros);
  }
}
