# GCV_api

Backend del módulo de **Novedades + Aprobación** para Grupo Corporativo Vértice (GCV).
Reto técnico — Pista B (Desarrollador Fullstack).

> El frontend vive en un repositorio aparte: **GCV_client** (React + Vite).

## Stack

- **NestJS 11** + TypeScript (`strict: true`)
- **TypeORM 0.3.30** + **PostgreSQL 16**
- **bcryptjs** para hash de contraseñas
- Autenticación **JWT simulada** (claims: `sub`, `email`, `rol`, `filial_id`) — Fase 3
- Gestor de paquetes: **pnpm** (bloquea install scripts por defecto → cadena de suministro más segura)

## Arquitectura

Modular con **hexagonal liviana por módulo** (`domain / application / infrastructure / presentation`).
Las reglas de seguridad (RBAC, aislamiento multi-tenant por `filial_id`) y el workflow de estados
viven en el **backend**, nunca solo en la UI.

```
src/
├── modules/
│   ├── users/domain/        # Filial, Usuario, Rol
│   ├── novedades/domain/    # Novedad, EstadoNovedad, TipoNovedad
│   └── auditoria/domain/    # Auditoria, AuditoriaAccion
├── database/
│   ├── entities.ts          # fuente única de entidades
│   ├── data-source.ts       # DataSource TypeORM (seed / CLI)
│   └── seed/seed.ts         # datos semilla del Anexo B
└── app.module.ts            # wiring ConfigModule + TypeOrmModule
```

## Requisitos

- Node.js 18+ (probado con 22)
- pnpm 10 (`npm install -g pnpm` o `corepack enable`)
- Docker + Docker Compose

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Crear el archivo .env (ver sección Variables de entorno)

# 3. Levantar PostgreSQL
docker compose up -d

# 4. Cargar datos semilla (Anexo B)
pnpm run seed

# 5. Arrancar la API en modo desarrollo
pnpm run start:dev
```

La API queda en `http://localhost:3000`.

## Variables de entorno (`.env`)

```env
# Conexión a PostgreSQL (para correr la API/seed desde el host)
DATABASE_URL=postgresql://reto:reto_pass@localhost:5432/reto_gcv

# true en dev: crea el esquema desde las entidades. En prod se usarían migrations.
DB_SYNCHRONIZE=true

# JWT (Fase 3)
JWT_SECRET=cambia_esto_en_local
JWT_EXPIRES_IN=8h
```

> El `.env` **no se versiona**. Las credenciales de la DB coinciden con las de `docker-compose.yml`.

## Datos semilla (Anexo B)

El seed es idempotente (no duplica si ya hay datos). Carga 2 filiales y 6 usuarios.
Contraseña compartida (hasheada con bcrypt, cost 10): **`Prueba2026*`**

| Email | Rol | Filial |
|-------|-----|--------|
| carla.colaborador@and.gcv.com | COLABORADOR | Andinagas (AND) |
| sergio.super@and.gcv.com | SUPERVISOR | Andinagas (AND) |
| rocio.rrhh@and.gcv.com | RRHH | Andinagas (AND) |
| diego.colaborador@ret.gcv.com | COLABORADOR | RetailVertice (RET) |
| sandra.super@ret.gcv.com | SUPERVISOR | RetailVertice (RET) |
| raul.rrhh@ret.gcv.com | RRHH | RetailVertice (RET) |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm run start:dev` | API en modo watch |
| `pnpm run build` | Compila a `dist/` |
| `pnpm run seed` | Carga los datos del Anexo B |
| `pnpm test` | Tests unitarios (Jest) |
| `pnpm run lint` | ESLint |

## Decisiones técnicas (defendibles)

- **`bcryptjs` (JS) en vez de `bcrypt` (nativo)**: evita el postinstall de compilación que pnpm v10 bloquea por seguridad.
- **TypeORM `0.3.30`, no `1.0.0`**: se prioriza la línea estable y documentada que NestJS soporta oficialmente sobre el major recién liberado.
- **`synchronize` en dev**: reproducibilidad inmediata; en producción se reemplaza por migrations.

## Estado del alcance

- [x] **Fase 1** — Scaffold NestJS + docker-compose (Postgres)
- [x] **Fase 2** — Entidades TypeORM, configuración de DB y seed del Anexo B
- [ ] **Fase 3** — Autenticación JWT + contexto de seguridad
- [ ] **Fase 4** — RBAC + aislamiento multi-tenant
- [ ] **Fase 5–8** — Novedades, workflow, auditoría, exportación CSV
- [ ] **Fase 10** — Pruebas automatizadas
