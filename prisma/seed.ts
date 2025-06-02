import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // First verify the connection
    await prisma.$connect();
    console.log('Successfully connected to the database');

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        password: 'hashed_password_here', // In production, this should be properly hashed
        name: 'Test User',
        bio: 'This is a test user account',
        emailVerified: true,
        updatedAt: new Date(),
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    });

    console.log('Created test user:', testUser);

    // Create mock album (id=1) if not exists
    let album = await prisma.album.findUnique({ where: { id: 1 } });
    if (!album) {
      album = await prisma.album.create({
        data: {
          id: 1,
          title: 'Roadhouse',
          artist: 'Bill Parker',
          image_url: '/covers/roadhouse.jpg',
          year: '2023',
          track_count: '3',
          duration: '13:00',
          updatedAt: new Date(),
        },
      });
      console.log('Created album:', album);
    } else {
      console.log('Album already exists:', album);
    }

    // Create mock tracks for album 1
    const tracksData = [
      {
        title: 'Opening Night',
        artist: 'Bill Parker',
        url: '/audio/opening-night.mp3',
        albumId: album.id,
        duration: '3:45',
        genre: 'Rock',
        updatedAt: new Date(),
      },
      {
        title: 'Bar Blues',
        artist: 'Bill Parker',
        url: '/audio/bar-blues.mp3',
        albumId: album.id,
        duration: '4:12',
        genre: 'Rock',
        updatedAt: new Date(),
      },
      {
        title: 'Encore',
        artist: 'Bill Parker',
        url: '/audio/encore.mp3',
        albumId: album.id,
        duration: '5:01',
        genre: 'Rock',
        updatedAt: new Date(),
      },
    ];
    for (const track of tracksData) {
      const exists = await prisma.song.findFirst({ where: { title: track.title, albumId: album.id } });
      if (!exists) {
        await prisma.song.create({ data: track });
        console.log('Created track:', track.title);
      } else {
        console.log('Track already exists:', track.title);
      }
    }

    // Create mock playlist for the test user and album 1
    let playlist = await prisma.playlist.findFirst({ where: { name: 'Test Playlist', userId: testUser.id } });
    if (!playlist) {
      playlist = await prisma.playlist.create({
        data: {
          name: 'Test Playlist',
          userId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          image_url: 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg',
        },
      });
      console.log('Created playlist:', playlist);
    } else {
      console.log('Playlist already exists:', playlist);
      // Update image_url if missing
      if (!playlist.image_url) {
        playlist = await prisma.playlist.update({
          where: { id: playlist.id },
          data: { image_url: 'https://images-na.ssl-images-amazon.com/images/I/91rO1rQ1HLL.jpg' },
        });
        console.log('Updated playlist image_url:', playlist);
      }
    }

    // Add all album 1 tracks to the playlist
    const albumTracks = await prisma.song.findMany({ where: { albumId: album.id } });
    for (const track of albumTracks) {
      const exists = await prisma.playlistsong.findFirst({ where: { playlistId: playlist.id, songId: track.id } });
      if (!exists) {
        await prisma.playlistsong.create({ data: { playlistId: playlist.id, songId: track.id } });
        console.log(`Added track ${track.title} to playlist`);
      } else {
        console.log(`Track ${track.title} already in playlist`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Failed to seed database:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 