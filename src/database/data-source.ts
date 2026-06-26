import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ENTITIES } from './entities';

// Carga .env para scripts standalone (seed) que corren fuera del contexto Nest.
config();

// Supuesto documentado: synchronize=true en dev crea el esquema desde las entidades
// (reproducibilidad inmediata: docker-compose up + start). En producción se usarían
// migrations. Se controla con DB_SYNCHRONIZE (default true).
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ENTITIES,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  // SSL requerido por Neon/Render; off en local. El seed también conecta por acá.
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
