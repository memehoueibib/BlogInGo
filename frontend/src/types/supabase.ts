// frontend/src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          user_id: string
          content: string
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          likes?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          firstname: string | null
          lastname: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          firstname?: string | null
          lastname?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          firstname?: string | null
          lastname?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}