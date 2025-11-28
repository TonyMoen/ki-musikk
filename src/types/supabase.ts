/**
 * Supabase Database Types
 * Auto-generated types based on database schema
 * Tables: user_profile, song, credit_transaction, genre, mastering_request
 */

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
      user_profile: {
        Row: {
          id: string
          display_name: string | null
          credit_balance: number
          preferences: Json
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      song: {
        Row: {
          id: string
          user_id: string
          title: string
          genre: string
          concept: string | null
          original_lyrics: string | null
          optimized_lyrics: string | null
          phonetic_enabled: boolean
          suno_song_id: string | null
          audio_url: string | null
          stream_audio_url: string | null  // Early playback URL from FIRST_SUCCESS
          duration_seconds: number | null
          status: 'generating' | 'partial' | 'completed' | 'failed' | 'cancelled'
          error_message: string | null
          canvas_url: string | null
          shared_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_preview: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          genre: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          stream_audio_url?: string | null
          duration_seconds?: number | null
          status: 'generating' | 'partial' | 'completed' | 'failed' | 'cancelled'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_preview?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          genre?: string
          concept?: string | null
          original_lyrics?: string | null
          optimized_lyrics?: string | null
          phonetic_enabled?: boolean
          suno_song_id?: string | null
          audio_url?: string | null
          stream_audio_url?: string | null
          duration_seconds?: number | null
          status?: 'generating' | 'partial' | 'completed' | 'failed' | 'cancelled'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_preview?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "song_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_transaction: {
        Row: {
          id: string
          user_id: string
          amount: number
          balance_after: number
          transaction_type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_session_id: string | null
          song_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          balance_after: number
          transaction_type: 'purchase' | 'deduction' | 'refund'
          description: string
          stripe_session_id?: string | null
          song_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          balance_after?: number
          transaction_type?: 'purchase' | 'deduction' | 'refund'
          description?: string
          stripe_session_id?: string | null
          song_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transaction_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transaction_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "song"
            referencedColumns: ["id"]
          }
        ]
      }
      genre: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          emoji: string | null
          suno_prompt_template: string
          sort_order: number
          is_active: boolean
          gradient_colors: Json
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          emoji?: string | null
          suno_prompt_template: string
          sort_order?: number
          is_active?: boolean
          gradient_colors?: Json
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          emoji?: string | null
          suno_prompt_template?: string
          sort_order?: number
          is_active?: boolean
          gradient_colors?: Json
        }
        Relationships: []
      }
      mastering_request: {
        Row: {
          id: string
          user_id: string
          song_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url: string | null
          notes: string | null
          requested_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url?: string | null
          notes?: string | null
          requested_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          song_id?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          mastered_audio_url?: string | null
          notes?: string | null
          requested_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mastering_request_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastering_request_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "song"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_song_id?: string | null
        }
        Returns: Database['public']['Tables']['credit_transaction']['Row']
      }
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_stripe_session_id?: string | null
        }
        Returns: Database['public']['Tables']['credit_transaction']['Row']
      }
      refund_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_song_id?: string | null
        }
        Returns: Database['public']['Tables']['credit_transaction']['Row']
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

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types for direct database row access
// Note: App-level types (Song, etc.) are in src/types/song.ts with optional fields
export type DbUserProfile = Tables<'user_profile'>
export type DbSong = Tables<'song'>
export type DbCreditTransaction = Tables<'credit_transaction'>
export type DbGenre = Tables<'genre'>
export type DbMasteringRequest = Tables<'mastering_request'>
