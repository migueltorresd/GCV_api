import { Injectable } from '@nestjs/common';
import { NovedadesRepository } from '../../novedades/infrastructure/novedades.repository';
import { CsvBuilderService } from '../infrastructure/csv-builder.service';
import type { JwtPayload } from '../../auth/domain/jwt-payload.interface';
import { AuditoriaService } from '../../auditoria/application/auditoria.service';
import { AuditoriaAccion } from '../../auditoria/domain/auditoria-accion.enum';

@Injectable()
export class ExportarCsvUseCase {
  constructor(
    private readonly novedades: NovedadesRepository,
    private readonly csvBuilder: CsvBuilderService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async execute(user: JwtPayload, desde?: string, hasta?: string): Promise<string> {
    // Solo APROBADAS de la filial del usuario (scope multi-tenant garantizado en la query).
    const aprobadas = await this.novedades.findAprobadas(user.filial_id, desde, hasta);
    const csv = this.csvBuilder.build(aprobadas);

    await this.auditoria.registrar({
      actor: user,
      accion: AuditoriaAccion.EXPORTAR,
      entidad: 'exportacion',
      entidadId: null,
      detalle: { desde: desde ?? null, hasta: hasta ?? null, registros: aprobadas.length },
    });

    return csv;
  }
}
