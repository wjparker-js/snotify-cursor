// TODO: Define types based on MySQL/Prisma schema if needed. Supabase types removed.

export interface Album {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  year: string | null;
  track_count: string | null;
  duration: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  album_id: string;
  title: string;
  artist: string;
  duration: string;
  plays: number;
  track_number: number;
  is_liked: boolean;
  created_at: string;
  genre?: string | null;
  audio_path?: string | null;
  album_name?: string | null;
}

export interface BlogArticle {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  image_url: string;
  author: string;
  published_at: string;
  category: string;
  created_at: string;
}

export interface BlogComment {
  id: string;
  article_id: string;
  user_name: string;
  content: string;
  created_at: string;
}
