# GCV_api

Backend del módulo de **Novedades + Aprobación** para Grupo Corporativo Vértice (GCV).
Reto técnico — Pista B (Desarrollador Fullstack).

> Frontend en repo aparte: **GCV_client** (React + Vite).

## Stack

- **NestJS 11** + TypeScript (`strict: true`)
- **TypeORM 0.3.30** + **PostgreSQL 16**
- **JWT simulado** (claims: `sub`, `email`, `rol`, `filial_id`) · **bcryptjs**
- **pnpm** (bloquea install scripts por seguridad) · **helmet** · **@nestjs/throttler**

## Arquitectura

Modular con **hexagonal liviana por módulo** (`domain / application / infrastructure / presentation`).
La seguridad (RBAC, aislamiento multi-tenant) y el workflow viven en el **backend**, nunca solo en la UI.

```
src/modules/
├── auth/        # login, JWT, guards (Jwt + Roles), @CurrentUser
├── users/       # entidad Usuario/Filial, repositorio
├── novedades/   # CRUD, workflow (política pura), visibilidad multi-tenant
├── auditoria/   # AuditoriaService + GET /auditoria (RRHH)
└── exportacion/ # CSV Anexo E
```

## Requisitos

- Node.js 18+ (probado con 22) · pnpm 10 (`corepack enable`) · Docker + Compose

## Puesta en marcha

```bash
pnpm install
# crear .env (ver abajo)
docker compose up -d          # PostgreSQL
pnpm run seed                 # datos Anexo B
pnpm run start:dev            # API en http://localhost:3000
```

### Variables de entorno (`.env`)

```env
DATABASE_URL=postgresql://reto:reto_pass@localhost:5432/reto_gcv
DB_SYNCHRONIZE=true            # crea el esquema en dev; en prod → migrations
JWT_SECRET=<secreto-fuerte>    # REQUERIDO: la app no arranca sin esto
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

## Endpoints

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/auth/login` | — | Login → `{ access_token }` (10 req/min) |
| POST | `/novedades` | COLABORADOR | Crear (estado BORRADOR) |
| GET | `/novedades` | todos | Listar (scope por rol+filial); filtros `tipo,estado,desde,hasta` |
| POST | `/novedades/:id/enviar` | COLABORADOR (owner) | BORRADOR → PENDIENTE |
| POST | `/novedades/:id/aprobar` | SUPERVISOR | PENDIENTE → APROBADA |
| POST | `/novedades/:id/rechazar` | SUPERVISOR | PENDIENTE → RECHAZADA `{ motivo }` |
| POST | `/novedades/aprobar-masivo` | SUPERVISOR | `{ ids }` → `{ procesados, ignorados }` |
| GET | `/auditoria` | RRHH | Log filtrable, scopeado por filial |
| GET | `/exportacion/csv` | RRHH | CSV Anexo E (`fecha_desde`, `fecha_hasta`) |

## Pruebas

```bash
pnpm test           # 35 unit tests
pnpm run test:cov   # con cobertura
```

Cobertura: lógica de negocio (use-cases, políticas de dominio, login, CSV builder) al **~100%**.
El cableado (controllers, módulos, repos) se valida E2E. Los **2 tests obligatorios** del reto
(transiciones de estado + RBAC/aislamiento) están automatizados.

## Datos semilla (Anexo B)

2 filiales (Andinagas `AND`, RetailVertice `RET`) + 6 usuarios. Password: **`Prueba2026*`** (bcrypt cost 10).

| Email | Rol | Filial |
|-------|-----|--------|
| carla.colaborador@and.gcv.com | COLABORADOR | AND |
| sergio.super@and.gcv.com | SUPERVISOR | AND |
| rocio.rrhh@and.gcv.com | RRHH | AND |
| diego.colaborador@ret.gcv.com | COLABORADOR | RET |
| sandra.super@ret.gcv.com | SUPERVISOR | RET |
| raul.rrhh@ret.gcv.com | RRHH | RET |

## Supuestos asumidos

- **`fecha_aprobacion`** se agregó a la entidad `novedad` (no estaba en Anexo A) porque el **Anexo E la exige**.
- La **exportación filtra por `fecha_inicio`** de la novedad (el período del evento), no por fecha de aprobación.
- **`GET /auditoria` restringido a RR.HH.** (el reto no fija rol; RR.HH. es quien audita).
- **Aprobación masiva = filter-and-skip**: ignora IDs no-PENDIENTE o de otra filial, no falla el batch.
- **JWT simulado** (sin proveedor OIDC real, permitido por el reto). Token en `localStorage` (tradeoff XSS documentado).
- **`synchronize` en dev**; en producción se usarían migrations.
- **CSV con separador `;`** por Anexo E — si Excel lo muestra en una columna es config regional, el archivo cumple la spec.

## Alcance (MoSCoW)

| | Requisito | Estado |
|---|-----------|--------|
| **Must** | Auth, RBAC, multi-tenant, novedades+workflow, auditoría, exportación CSV, 2 pruebas | ✅ Cubierto |
| **Should** | Operación offline/PWA (RT-06), notificaciones (RT-08) | ❌ No cubierto — fuera de las 16h, no es núcleo |
| **Could/Won't** | Adjuntos reales, almacenamiento de archivos, firma electrónica (RT-07) | ❌ No cubierto — fuera del flujo MUST de Pista B |

Decisión consciente: priorizar el **núcleo seguro y trazable** sobre features adicionales incompletas.

## Tiempo aproximado invertido

| Componente | Horas |
|------------|-------|
| Scaffold + docker-compose + pnpm | 1.0 |
| Persistencia + seed (Anexo B) | 1.5 |
| Auth (JWT, guards, CORS) | 2.0 |
| RBAC + aislamiento multi-tenant | 1.5 |
| Novedades CRUD | 2.0 |
| Workflow de estados | 1.5 |
| Auditoría | 1.0 |
| Exportación CSV | 1.0 |
| Pruebas (unit + E2E) | 1.5 |
| Hardening de seguridad (OWASP) | 1.0 |
| Frontend (repo GCV_client) | 2.5 |
| Documentación | 0.5 |
| **Total** | **~17h** |

> Estimación; ajustar al tiempo real.

## Decisiones técnicas

Ver [DECISIONES.md](DECISIONES.md) — ADRs breves (pnpm, TypeORM 0.3.x, bcryptjs, synchronize, hexagonal liviana, multi-tenant, hardening OWASP).
