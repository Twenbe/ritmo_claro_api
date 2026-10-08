// Script interno (D-04): asigna el rol ADMIN a una cuenta existente.
// Uso: npm run admin:promover -- <email>
// Requiere `npm run build` previo (usa el cliente Prisma compilado en dist/)
// y DATABASE_URL en el entorno o en .env. Nunca imprime la cadena de conexión.
require('dotenv/config');
const path = require('node:path');
const { PrismaPg } = require('@prisma/adapter-pg');

const RUTA_CLIENTE = path.join(
  __dirname,
  '..',
  'dist',
  'generated',
  'prisma',
  'client.js',
);

function salir(mensaje) {
  console.error(mensaje);
  process.exit(1);
}

async function main() {
  const email = (process.argv[2] ?? '').trim().toLowerCase(); // D-07
  if (!email) {
    salir('Uso: npm run admin:promover -- <email>');
  }
  if (!process.env.DATABASE_URL) {
    salir('Falta la variable de entorno DATABASE_URL');
  }

  let PrismaClient;
  try {
    ({ PrismaClient } = require(RUTA_CLIENTE));
  } catch {
    salir(
      'No se encontró el cliente compilado. Ejecuta primero: npm run build',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, rol: true },
    });
    if (!usuario) {
      salir(`No existe una cuenta con el email ${email}`);
    }
    if (usuario.rol === 'ADMIN') {
      console.log(`${email} ya tiene el rol ADMIN; no se hicieron cambios.`);
      return;
    }

    await prisma.usuario.update({
      where: { email },
      data: { rol: 'ADMIN' },
    });
    console.log(`${email} ahora tiene el rol ADMIN.`);
    console.log(
      'El token que ya tenía conserva el rol anterior: debe iniciar sesión de nuevo.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Solo el tipo de error: el detalle puede incluir datos de conexión.
  salir(`No se pudo promover la cuenta (${error.code ?? error.name}).`);
});
