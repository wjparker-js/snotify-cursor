import type { NextApiRequest, NextApiResponse } from 'next';

const mockAlbums = {
  a1: [
    {
      id: '1',
      title: 'Roadhouse',
      artist: 'Bill Parker',
      cover: '/covers/roadhouse.jpg',
      year: 2023,
    },
    {
      id: '2',
      title: 'Viking',
      artist: 'Bill Parker',
      cover: '/covers/viking.jpg',
      year: 2022,
    },
  ],
  a2: [
    {
      id: '3',
      title: 'Home',
      artist: 'Gerry Hodgett',
      cover: '/covers/home.jpg',
      year: 2021,
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    const albums = mockAlbums[id as keyof typeof mockAlbums] || [];
    res.status(200).json(albums);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 