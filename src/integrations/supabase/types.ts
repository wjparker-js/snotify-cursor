export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          artist: string
          created_at: string
          duration: string | null
          id: string
          image_url: string
          title: string
          track_count: string | null
          year: string | null
        }
        Insert: {
          artist: string
          created_at?: string
          duration?: string | null
          id?: string
          image_url: string
          title: string
          track_count?: string | null
          year?: string | null
        }
        Update: {
          artist?: string
          created_at?: string
          duration?: string | null
          id?: string
          image_url?: string
          title?: string
          track_count?: string | null
          year?: string | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author: string
          category: string | null
          content: string | null
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published_at: string
          subtitle: string | null
          title: string
        }
        Insert: {
          author: string
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          published_at?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          author?: string
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published_at?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          id: string
          user_name: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          id?: string
          user_name: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          id?: string
          user_name?: string
        }
        Relationships: []
      }
      login_audit: {
        Row: {
          email: string
          id: string
          ip_address: string | null
          login_timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      playlist_tracks: {
        Row: {
          added_at: string
          album_name: string | null
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          added_at?: string
          album_name?: string | null
          id?: string
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          added_at?: string
          album_name?: string | null
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          owner: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          owner?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          owner?: string
          title?: string
        }
        Relationships: []
      }
      registered_users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_login?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          album_id: string
          artist: string
          audio_path: string | null
          created_at: string
          duration: string
          genre: string | null
          id: string
          is_liked: boolean | null
          plays: number | null
          title: string
          track_number: number
        }
        Insert: {
          album_id: string
          artist: string
          audio_path?: string | null
          created_at?: string
          duration: string
          genre?: string | null
          id?: string
          is_liked?: boolean | null
          plays?: number | null
          title: string
          track_number: number
        }
        Update: {
          album_id?: string
          artist?: string
          audio_path?: string | null
          created_at?: string
          duration?: string
          genre?: string | null
          id?: string
          is_liked?: boolean | null
          plays?: number | null
          title?: string
          track_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          liked_songs_count: number | null
          sidebar_visible: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_songs_count?: number | null
          sidebar_visible?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_songs_count?: number | null
          sidebar_visible?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_blog_comment: {
        Args: {
          article_id_param: string
          user_name_param: string
          content_param: string
        }
        Returns: Json
      }
      delete_blog_article: {
        Args: { article_id_param: string }
        Returns: boolean
      }
      get_comments_for_article: {
        Args: { article_id_param: string }
        Returns: Json[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
