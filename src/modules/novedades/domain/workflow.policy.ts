import { EstadoNovedad } from './novedad-estado.enum';
import { InvalidTransitionException } from './invalid-transition.exception';

// Máquina de estados: BORRADOR → PENDIENTE → APROBADA | RECHAZADA.
// Los estados finales (APROBADA / RECHAZADA) no transicionan a nada.
const TRANSICIONES_VALIDAS: Record<EstadoNovedad, EstadoNovedad[]> = {
  [EstadoNovedad.BORRADOR]: [EstadoNovedad.PENDIENTE],
  [EstadoNovedad.PENDIENTE]: [EstadoNovedad.APROBADA, EstadoNovedad.RECHAZADA],
  [EstadoNovedad.APROBADA]: [],
  [EstadoNovedad.RECHAZADA]: [],
};

// Versión booleana (no lanza): útil para la aprobación masiva (filter-and-skip).
export function puedeTransicionar(desde: EstadoNovedad, hacia: EstadoNovedad): boolean {
  return TRANSICIONES_VALIDAS[desde].includes(hacia);
}

// Versión estricta (lanza): para las acciones individuales que deben fallar explícitamente.
export function validarTransicion(desde: EstadoNovedad, hacia: EstadoNovedad): void {
  if (!puedeTransicionar(desde, hacia)) {
    throw new InvalidTransitionException(desde, hacia);
  }
}
