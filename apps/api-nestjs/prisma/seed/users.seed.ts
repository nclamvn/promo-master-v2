import { PrismaClient, Role } from '@prisma/client';

const DUMMY_PASSWORD_HASH =
  '$2b$10$dummyhashforseeding000000000000000000000000000';

export async function seedUsers(
  prisma: PrismaClient,
  companyId: string,
) {
  console.log('  Seeding users...');

  const usersData = [
    {
      email: 'admin@demo.com',
      name: 'Nguyen Van Admin',
      role: Role.ADMIN,
      avatar: null,
    },
    {
      email: 'manager1@demo.com',
      name: 'Tran Thi Manager',
      role: Role.MANAGER,
      avatar: null,
    },
    {
      email: 'manager2@demo.com',
      name: 'Le Hoang Minh',
      role: Role.MANAGER,
      avatar: null,
    },
    {
      email: 'kam1@demo.com',
      name: 'Pham Thanh Tung',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam2@demo.com',
      name: 'Vo Thi Lan',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam3@demo.com',
      name: 'Dang Quoc Bao',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'kam4@demo.com',
      name: 'Bui Ngoc Anh',
      role: Role.KAM,
      avatar: null,
    },
    {
      email: 'finance1@demo.com',
      name: 'Hoang Thi Thu',
      role: Role.FINANCE,
      avatar: null,
    },
    {
      email: 'finance2@demo.com',
      name: 'Ngo Duc Tai',
      role: Role.FINANCE,
      avatar: null,
    },
    {
      email: 'kam5@demo.com',
      name: 'Ly Minh Hoa',
      role: Role.KAM,
      avatar: null,
    },
  ];

  const users = await prisma.$transaction(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: DUMMY_PASSWORD_HASH,
          role: u.role,
          avatar: u.avatar,
          isActive: true,
          companyId,
        },
      }),
    ),
  );

  console.log(`  Created ${users.length} users`);
  return users;
}
