import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyUser() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'test@example.com'
    }
  });
  
  console.log('Found user:', user);
}

verifyUser()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 