import prisma from '../integrations/mysql';

// TODO: Implement playlist CRUD using Prisma. These are stubs for future implementation.

async function getPlaylists() {
  return await prisma.playlist.findMany({
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getPlaylistById(playlistId) {
  return await prisma.playlist.findUnique({
    where: { id: Number(playlistId) },
    include: {
      user: true,
      playlistsong: {
        include: {
          song: true,
        },
      },
    },
  });
}

async function createPlaylist(/* playlistData */) {
  throw new Error('Playlist creation is not implemented. Replace with Prisma logic.');
}

async function updatePlaylist(/* playlistId, playlistData */) {
  throw new Error('Playlist update is not implemented. Replace with Prisma logic.');
}

async function deletePlaylist(/* playlistId */) {
  throw new Error('Playlist deletion is not implemented. Replace with Prisma logic.');
}

async function setPlaylistCoverBlob(playlistId, buffer) {
  return await prisma.playlist.update({
    where: { id: Number(playlistId) },
    data: { cover_blob: buffer },
  });
}

module.exports = { getPlaylists, getPlaylistById, createPlaylist, updatePlaylist, deletePlaylist, setPlaylistCoverBlob }; 