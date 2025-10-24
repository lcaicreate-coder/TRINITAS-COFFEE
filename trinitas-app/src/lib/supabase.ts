import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are properly set
export const supabase = supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://') 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// 檢查 Supabase 是否可用
export function isSupabaseAvailable(): boolean {
  return supabase !== null
}

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          order_number: number | null
          display_name: string
          note: string | null
          status: string
          created_at: number
          updated_at: string | null
          items: any[]
        }
        Insert: {
          id?: string
          order_number?: number | null
          display_name: string
          note?: string | null
          status?: string
          created_at?: number
          updated_at?: string | null
          items?: any[]
        }
        Update: {
          id?: string
          order_number?: number | null
          display_name?: string
          note?: string | null
          status?: string
          created_at?: number
          updated_at?: string | null
          items?: any[]
        }
      }
    }
  }
}
