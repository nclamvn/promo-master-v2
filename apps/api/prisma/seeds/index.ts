import { PrismaClient } from '@prisma/client';
import { seedGeographicUnits } from './geographic-units';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Seed Geographic Units (hierarchy data)
  await seedGeographicUnits();

  console.log('Database seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
