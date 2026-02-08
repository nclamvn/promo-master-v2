import { PrismaClient } from '@prisma/client';
import { seedCompany } from './company.seed';
import { seedUsers } from './users.seed';
import { seedGeographicUnits } from './master-data.seed';
import { seedCustomers } from './customers.seed';
import { seedProducts } from './products.seed';
import { seedBudgets } from './budgets.seed';
import { seedPromotions } from './promotions.seed';
import { seedClaims } from './claims.seed';
import { seedTransactions } from './transactions.seed';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database...');

  // Clear in reverse dependency order
  await prisma.transaction.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.fund.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.geographicUnit.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('Database cleared.\n');
}

async function main() {
  console.log('=== Promo Master V3 - Database Seed ===\n');

  await clearDatabase();

  // 1. Company (required for all other models)
  const company = await seedCompany(prisma);

  // 2. Users (requires company)
  const users = await seedUsers(prisma, company.id);

  // 3. Geographic Units (master data, no company dependency)
  const geoUnits = await seedGeographicUnits(prisma);

  // 4. Customers (requires company)
  const customers = await seedCustomers(prisma, company.id);

  // 5. Products (requires company)
  const products = await seedProducts(prisma, company.id);

  // 6. Budgets, Allocations & Funds (requires company, users, geo units)
  const adminUser = users.find((u) => u.role === 'ADMIN') || users[0];
  const { budgets, allocations, funds } = await seedBudgets(
    prisma,
    company.id,
    adminUser.id,
    geoUnits,
  );

  // 7. Promotions (requires customers, funds, users)
  const promotions = await seedPromotions(prisma, {
    companyId: company.id,
    customers,
    funds,
    users,
  });

  // 8. Claims & Settlements (requires customers, promotions, users)
  const { claims, settlements } = await seedClaims(prisma, {
    customers,
    promotions,
    users,
  });

  // 9. Transactions (requires funds, promotions, claims)
  const transactions = await seedTransactions(prisma, {
    funds,
    promotions,
    claims,
  });

  console.log('\n=== Seed Summary ===');
  console.log(`  Company:       1`);
  console.log(`  Users:         ${users.length}`);
  console.log(`  Geo Units:     ${geoUnits.all.length}`);
  console.log(`  Customers:     ${customers.length}`);
  console.log(`  Products:      ${products.length}`);
  console.log(`  Budgets:       ${budgets.length}`);
  console.log(`  Allocations:   ${allocations.length}`);
  console.log(`  Funds:         ${funds.length}`);
  console.log(`  Promotions:    ${promotions.length}`);
  console.log(`  Claims:        ${claims.length}`);
  console.log(`  Settlements:   ${settlements.length}`);
  console.log(`  Transactions:  ${transactions.length}`);
  console.log('\n=== Seed Complete ===');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
