import type { NextApiRequest, NextApiResponse } from 'next';

const mockArtists = [
  {
    id: 'a1',
    name: 'Bill Parker',
    cover: '/covers/roadhouse.jpg',
    bio: 'A talented musician known for their unique style and captivating performances.',
    monthlyListeners: '1.2M',
    followers: '500K',
    isFollowing: false,
  },
  {
    id: 'a2',
    name: 'Gerry Hodgett',
    cover: '/covers/viking.jpg',
    bio: 'A creative artist with a passion for storytelling through music.',
    monthlyListeners: '800K',
    followers: '300K',
    isFollowing: false,
  },
  // Add more mock artists as needed
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (method === 'GET') {
    const artist = mockArtists.find((a) => a.id === id);
    if (artist) {
      res.status(200).json(artist);
    } else {
      res.status(404).json({ error: 'Artist not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 