import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
console.log('Prisma client keys:', Object.keys(prisma));
console.log('user:', typeof prisma.user, 'tenant:', typeof prisma.tenant, 'userTenant:', typeof prisma.userTenant);
process.exit(0); 