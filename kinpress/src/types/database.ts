export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_articles: {
        Row: {
          id: string;
          user_id: string;
          article_slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          article_slug: string;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_slug: string;
          author_name: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_slug?: string;
          author_name?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
