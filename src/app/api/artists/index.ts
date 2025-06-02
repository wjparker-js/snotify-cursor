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
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(mockArtists);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 