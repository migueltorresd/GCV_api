import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtGuard } from '../../auth/presentation/jwt.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { Rol } from '../../users/domain/rol.enum';
import { ExportarCsvUseCase } from '../application/exportar-csv.use-case';
import { ExportFiltrosDto } from './export-filtros.dto';

@Controller('exportacion')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Rol.RRHH) // Solo RR.HH. exporta (Anexo C); el resto recibe 403.
export class ExportacionController {
  constructor(private readonly exportarCsv: ExportarCsvUseCase) {}

  @Get('csv')
  async csv(
    @CurrentUser() user: JwtPayload,
    @Query() filtros: ExportFiltrosDto,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.exportarCsv.execute(user, filtros.fecha_desde, filtros.fecha_hasta);

    // text/csv UTF-8 sin BOM + descarga como archivo.
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="novedades.csv"',
    });
    res.send(csv);
  }
}
