import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          display_name: string
          note: string | null
          status: string
          created_at: number
          menu_item_id: string
          qty: number
        }
        Insert: {
          id: string
          display_name: string
          note?: string | null
          status?: string
          created_at: number
          menu_item_id: string
          qty?: number
        }
        Update: {
          id?: string
          display_name?: string
          note?: string | null
          status?: string
          created_at?: number
          menu_item_id?: string
          qty?: number
        }
      }
    }
  }
}
