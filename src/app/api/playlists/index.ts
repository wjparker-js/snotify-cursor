import type { NextApiRequest, NextApiResponse } from 'next';

const mockPlaylists = [
  {
    id: 'p1',
    title: 'Chill Vibes',
    cover: '/covers/chill.jpg',
    owner: 'User1',
    trackCount: 20,
  },
  {
    id: 'p2',
    title: 'Workout Hits',
    cover: '/covers/workout.jpg',
    owner: 'User2',
    trackCount: 15,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(mockPlaylists);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 