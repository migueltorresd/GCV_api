# Decisiones técnicas (ADRs)

Registro breve de decisiones. Formato: Contexto · Decisión · Alternativas · Consecuencias.

## ADR-01 · Aislamiento multi-tenant por discriminador de fila

- **Contexto:** 2 filiales, datos no visibles entre sí (RT-03).
- **Decisión:** `filial_id` como columna en cada tabla; toda query scopeada por él. La regla vive en una política pura (`visibilidad.policy`) consumida por el repositorio.
- **Alternativas:** schema-por-tenant, base-por-tenant.
- **Consecuencias:** simple y suficiente para 2 filiales; el aislamiento se prueba unitariamente sin DB. No aísla a nivel físico (aceptable al volumen del reto).

## ADR-02 · Autorización ≠ scoping de datos

- **Decisión:** `RolesGuard` decide acceso al endpoint (403); el scoping decide qué filas ve cada uno (filtra). Son capas separadas.
- **Consecuencia:** un colaborador puede listar, pero solo ve lo suyo (no recibe 403 por las ajenas, recibe una lista filtrada). Evita acoplar HTTP con persistencia.

## ADR-03 · Workflow como función pura de dominio

- **Decisión:** la máquina de estados (`workflow.policy`) es una función pura que valida transiciones; lanza `InvalidTransitionException` (→ 400).
- **Alternativas:** librería FSM, enum-en-DB con triggers.
- **Consecuencia:** portable y testeable sin infraestructura; es la regla de negocio, no un artefacto técnico.

## ADR-04 · Aprobación masiva: filter-and-skip

- **Contexto:** aprobar varios IDs a la vez.
- **Decisión:** filtrar a PENDIENTE de la filial y aprobar esos; ignorar el resto; devolver `{ procesados, ignorados }`. NO reutilizar el caso individual (que lanza).
- **Consecuencia:** un ID ya aprobado no rompe el batch — comportamiento idempotente y predecible.

## ADR-05 · gestor pnpm (no npm)

- **Decisión:** pnpm 10.
- **Razón:** **bloquea install scripts por defecto** (mitiga el vector #1 de cadena de suministro); `node_modules` estricto (sin phantom deps); más rápido.
- **Consecuencia:** se usa `bcryptjs` en vez de `bcrypt` nativo para evitar el build script bloqueado.

## ADR-06 · TypeORM 0.3.30 (no 1.0.0)

- **Contexto:** TypeORM 1.0.0 salió recientemente.
- **Decisión:** pinear a la línea estable 0.3.x que NestJS soporta oficialmente.
- **Consecuencia:** más documentación y madurez; menos riesgo en un entregable. Defendible sobre "estar en el último major".

## ADR-07 · Esquema con `synchronize` en dev

- **Decisión:** `synchronize` solo si `DB_SYNCHRONIZE=true` (seguro por defecto). En prod → migrations.
- **Consecuencia:** reproducibilidad inmediata (`docker compose up` + seed). Documentado como dev-only.

## ADR-08 · Hardening OWASP Top 10

- **Decisión:** JWT_SECRET sin default (fail-fast), CORS allowlist, helmet, rate-limit en login, `multer` parcheado (override), `ValidationPipe` whitelist.
- **Consecuencia:** cubre A01–A07 del Top 10; `pnpm audit` sin vulnerabilidades conocidas.

## ADR-09 · Auditoría centralizada

- **Decisión:** `AuditoriaService.registrar()` invocado desde los casos de uso (no desde controllers ni interceptores genéricos). `detalle` JSONB para contexto (motivo de rechazo, IDs del masivo).
- **Consecuencia:** control explícito sobre qué se audita; append-only a nivel app.
