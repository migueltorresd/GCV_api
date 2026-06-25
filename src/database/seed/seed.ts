import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { Filial } from '../../modules/users/domain/filial.entity';
import { Usuario } from '../../modules/users/domain/user.entity';
import { Rol } from '../../modules/users/domain/rol.enum';

// Datos semilla del Anexo B. Password compartida hasheada con bcrypt (nunca en texto plano).
const PASSWORD = 'Prueba2026*';
const BCRYPT_COST = 10;

interface SeedUser {
  email: string;
  nombre: string;
  rol: Rol;
  filialId: number;
  supervisorEmail?: string;
}

const USUARIOS: SeedUser[] = [
  { email: 'carla.colaborador@and.gcv.com', nombre: 'Carla Nunez', rol: Rol.COLABORADOR, filialId: 1, supervisorEmail: 'sergio.super@and.gcv.com' },
  { email: 'sergio.super@and.gcv.com', nombre: 'Sergio Paez', rol: Rol.SUPERVISOR, filialId: 1 },
  { email: 'rocio.rrhh@and.gcv.com', nombre: 'Rocio Velez', rol: Rol.RRHH, filialId: 1 },
  { email: 'diego.colaborador@ret.gcv.com', nombre: 'Diego Mora', rol: Rol.COLABORADOR, filialId: 2, supervisorEmail: 'sandra.super@ret.gcv.com' },
  { email: 'sandra.super@ret.gcv.com', nombre: 'Sandra Ortiz', rol: Rol.SUPERVISOR, filialId: 2 },
  { email: 'raul.rrhh@ret.gcv.com', nombre: 'Raul Bermudez', rol: Rol.RRHH, filialId: 2 },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const filialRepo = AppDataSource.getRepository(Filial);
  const userRepo = AppDataSource.getRepository(Usuario);

  // Idempotencia: no re-sembrar si ya hay datos.
  if ((await filialRepo.count()) > 0) {
    console.log('Seed ya aplicado — se omite.');
    await AppDataSource.destroy();
    return;
  }

  await filialRepo.save([
    filialRepo.create({ id: 1, nombre: 'Andinagas', codigo: 'AND' }),
    filialRepo.create({ id: 2, nombre: 'RetailVertice', codigo: 'RET' }),
  ]);

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_COST);

  // 1ª pasada: crear todos los usuarios sin supervisor.
  const guardados = await userRepo.save(
    USUARIOS.map((u) =>
      userRepo.create({
        email: u.email,
        nombre: u.nombre,
        rol: u.rol,
        filialId: u.filialId,
        passwordHash,
      }),
    ),
  );

  // 2ª pasada: linkear supervisor_id por email.
  const idPorEmail = new Map(guardados.map((u) => [u.email, u.id]));
  for (const u of USUARIOS) {
    if (!u.supervisorEmail) continue;
    const supervisorId = idPorEmail.get(u.supervisorEmail);
    if (supervisorId) {
      await userRepo.update({ email: u.email }, { supervisorId });
    }
  }

  console.log(`Seed OK: 2 filiales, ${guardados.length} usuarios.`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});
