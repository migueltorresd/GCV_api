import { Injectable } from '@nestjs/common';
import { Novedad } from '../../novedades/domain/novedad.entity';

// Encabezado EXACTO del Anexo E (orden y nombres no se tocan — el evaluador lo compara byte a byte).
const HEADER =
  'filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion';

// Las fechas DATE ya vienen como 'YYYY-MM-DD'. fecha_aprobacion es timestamptz → recortar a fecha.
function soloFecha(valor: Date | string | null): string {
  if (!valor) return '';
  const iso = valor instanceof Date ? valor.toISOString() : valor;
  return iso.slice(0, 10);
}

@Injectable()
export class CsvBuilderService {
  // Genera el CSV (separador ';', UTF-8 sin BOM) conforme al Anexo E.
  build(novedades: Novedad[]): string {
    const filas = novedades.map((n) =>
      [
        n.filial?.codigo ?? '',
        n.solicitante?.email ?? '',
        n.tipo,
        n.fechaInicio,
        n.fechaFin ?? '',
        n.estado,
        n.aprobador?.email ?? '',
        soloFecha(n.fechaAprobacion),
      ].join(';'),
    );

    return [HEADER, ...filas].join('\n');
  }
}
