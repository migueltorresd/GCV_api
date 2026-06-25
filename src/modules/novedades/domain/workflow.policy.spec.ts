import { EstadoNovedad } from './novedad-estado.enum';
import { InvalidTransitionException } from './invalid-transition.exception';
import { puedeTransicionar, validarTransicion } from './workflow.policy';

describe('WorkflowPolicy (transiciones de estado controladas en backend)', () => {
  describe('transiciones VÁLIDAS', () => {
    it('BORRADOR → PENDIENTE', () => {
      expect(() => validarTransicion(EstadoNovedad.BORRADOR, EstadoNovedad.PENDIENTE)).not.toThrow();
    });
    it('PENDIENTE → APROBADA', () => {
      expect(() => validarTransicion(EstadoNovedad.PENDIENTE, EstadoNovedad.APROBADA)).not.toThrow();
    });
    it('PENDIENTE → RECHAZADA', () => {
      expect(() => validarTransicion(EstadoNovedad.PENDIENTE, EstadoNovedad.RECHAZADA)).not.toThrow();
    });
  });

  describe('transiciones INVÁLIDAS (deben lanzar)', () => {
    it('BORRADOR → APROBADA (saltea PENDIENTE)', () => {
      expect(() => validarTransicion(EstadoNovedad.BORRADOR, EstadoNovedad.APROBADA)).toThrow(
        InvalidTransitionException,
      );
    });
    it('APROBADA → RECHAZADA (estado final)', () => {
      expect(() => validarTransicion(EstadoNovedad.APROBADA, EstadoNovedad.RECHAZADA)).toThrow(
        InvalidTransitionException,
      );
    });
    it('RECHAZADA → PENDIENTE (estado final)', () => {
      expect(() => validarTransicion(EstadoNovedad.RECHAZADA, EstadoNovedad.PENDIENTE)).toThrow(
        InvalidTransitionException,
      );
    });
    it('PENDIENTE → BORRADOR (no se retrocede)', () => {
      expect(() => validarTransicion(EstadoNovedad.PENDIENTE, EstadoNovedad.BORRADOR)).toThrow(
        InvalidTransitionException,
      );
    });
  });

  describe('puedeTransicionar (versión booleana, no lanza)', () => {
    it('true para válida', () => {
      expect(puedeTransicionar(EstadoNovedad.PENDIENTE, EstadoNovedad.APROBADA)).toBe(true);
    });
    it('false para una ya aprobada (clave para el masivo filter-and-skip)', () => {
      expect(puedeTransicionar(EstadoNovedad.APROBADA, EstadoNovedad.APROBADA)).toBe(false);
    });
  });
});
