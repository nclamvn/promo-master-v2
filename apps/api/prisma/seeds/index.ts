import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedGeographicUnits } from './geographic-units';
import { seedDemoData } from './demo-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed Users first (creates company too)
  await seedUsers();
  console.log('');

  // Seed Geographic Units (hierarchy data)
  await seedGeographicUnits();
  console.log('');

  // Seed Demo Data (budgets, targets, allocations, activities)
  await seedDemoData();
  console.log('');

  console.log('🎉 Database seed completed!');
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
