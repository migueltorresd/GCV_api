import { BadRequestException } from '@nestjs/common';

// Decisión pragmática: extiende BadRequestException para mapear a HTTP 400 automáticamente.
// La regla en sí (workflow.policy) sigue siendo pura y testeable.
export class InvalidTransitionException extends BadRequestException {
  constructor(desde: string, hacia: string) {
    super(`Transición de estado inválida: ${desde} → ${hacia}`);
  }
}
