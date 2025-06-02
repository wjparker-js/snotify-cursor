export interface Artist {
  id: string;
  name: string;
  cover: string;
  bio: string;
  monthlyListeners: string;
  followers: string;
  isFollowing?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  year: number;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  isLiked?: boolean;
  isPlaying?: boolean;
} 