import { CsvBuilderService } from './csv-builder.service';
import { Novedad } from '../../novedades/domain/novedad.entity';
import { EstadoNovedad } from '../../novedades/domain/novedad-estado.enum';
import { TipoNovedad } from '../../novedades/domain/novedad-tipo.enum';

const HEADER =
  'filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion';

function novedad(p: Partial<Novedad>): Novedad {
  return p as Novedad;
}

describe('CsvBuilderService (Anexo E)', () => {
  const builder = new CsvBuilderService();

  it('emite el encabezado EXACTO del Anexo E', () => {
    expect(builder.build([])).toBe(HEADER);
  });

  it('mapea una fila: filial_codigo, emails y fecha_aprobacion (solo fecha)', () => {
    const n = novedad({
      tipo: TipoNovedad.HORAS_EXTRA,
      estado: EstadoNovedad.APROBADA,
      fechaInicio: '2026-07-10',
      fechaFin: '2026-07-10',
      fechaAprobacion: new Date('2026-07-11T10:30:00Z'),
      filial: { id: 1, nombre: 'Andinagas', codigo: 'AND' },
      solicitante: { email: 'carla.colaborador@and.gcv.com' } as Novedad['solicitante'],
      aprobador: { email: 'sergio.super@and.gcv.com' } as Novedad['aprobador'],
    });
    const fila = builder.build([n]).split('\n')[1];
    expect(fila).toBe(
      'AND;carla.colaborador@and.gcv.com;HORAS_EXTRA;2026-07-10;2026-07-10;APROBADA;sergio.super@and.gcv.com;2026-07-11',
    );
  });

  it('fecha_fin y fecha_aprobacion nulas → campos vacíos (sin romper el formato)', () => {
    const n = novedad({
      tipo: TipoNovedad.ACTUALIZACION_DATOS,
      estado: EstadoNovedad.APROBADA,
      fechaInicio: '2026-08-01',
      fechaFin: null,
      fechaAprobacion: null,
      filial: { id: 1, nombre: 'Andinagas', codigo: 'AND' },
      solicitante: { email: 'carla@and.gcv.com' } as Novedad['solicitante'],
      aprobador: { email: 'sergio@and.gcv.com' } as Novedad['aprobador'],
    });
    const fila = builder.build([n]).split('\n')[1];
    expect(fila).toBe('AND;carla@and.gcv.com;ACTUALIZACION_DATOS;2026-08-01;;APROBADA;sergio@and.gcv.com;');
  });
});
