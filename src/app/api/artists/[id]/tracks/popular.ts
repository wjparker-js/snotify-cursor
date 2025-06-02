import type { NextApiRequest, NextApiResponse } from 'next';

const mockTracks = {
  a1: [
    {
      id: 't1',
      title: 'Roadhouse Blues',
      artist: 'Bill Parker',
      album: 'Roadhouse',
      duration: '3:45',
      cover: '/covers/roadhouse.jpg',
    },
    {
      id: 't2',
      title: 'Viking Spirit',
      artist: 'Bill Parker',
      album: 'Viking',
      duration: '4:20',
      cover: '/covers/viking.jpg',
    },
  ],
  a2: [
    {
      id: 't3',
      title: 'Homecoming',
      artist: 'Gerry Hodgett',
      album: 'Home',
      duration: '3:30',
      cover: '/covers/home.jpg',
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    const tracks = mockTracks[id as keyof typeof mockTracks] || [];
    res.status(200).json(tracks);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 