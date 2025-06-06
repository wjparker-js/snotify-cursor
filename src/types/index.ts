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
  cover_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  file_url?: string;
  album_id?: string;
  cover: string;
  isLiked?: boolean;
  isPlaying?: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  excerpt?: string | null;
  image_url?: string | null;
  author: string;
  category?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
} 