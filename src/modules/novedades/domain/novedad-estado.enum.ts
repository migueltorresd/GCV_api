// Estados del workflow de novedades (Anexo A: CHECK estado IN (...)).
// Transiciones válidas: BORRADOR → PENDIENTE → APROBADA | RECHAZADA.
export enum EstadoNovedad {
  BORRADOR = 'BORRADOR',
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}
