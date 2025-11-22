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
      user_profile: {
        Row: {
          id: string
          display_name: string | null
          credit_balance: number
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          credit_balance?: number
          preferences?: Json
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
          duration_seconds: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message: string | null
          canvas_url: string | null
          shared_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
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
          duration_seconds?: number | null
          status: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
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
          duration_seconds?: number | null
          status?: 'generating' | 'completed' | 'failed'
          error_message?: string | null
          canvas_url?: string | null
          shared_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transaction_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
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
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastering_request_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
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
          p_song_id?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
