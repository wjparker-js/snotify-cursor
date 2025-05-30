import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  await prisma.album.createMany({
    data: [
      {
        title: 'Test Album 1',
        artist: 'Test Artist 1',
        image_url: 'https://via.placeholder.com/300x300.png?text=Album+1',
        year: '2024',
        track_count: '10',
        duration: '35:00',
      },
      {
        title: 'Test Album 2',
        artist: 'Test Artist 2',
        image_url: 'https://via.placeholder.com/300x300.png?text=Album+2',
        year: '2023',
        track_count: '8',
        duration: '28:15',
      },
      {
        title: 'Test Album 3',
        artist: 'Test Artist 3',
        image_url: 'https://via.placeholder.com/300x300.png?text=Album+3',
        year: '2022',
        track_count: '12',
        duration: '42:10',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('Seed complete');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  }); 