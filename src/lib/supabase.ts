import { createClient } from '@supabase/supabase-js'

// .env.local 파일에서 환경 변수를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 타입스크립트를 위해 환경 변수가 없을 경우 에러를 발생시킵니다.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env.local')
}

// Supabase 클라이언트를 생성하고 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export interface Restaurant {
  id: number;
  name: string;
  category: string;
  address: string;
  phone?: string;
  rating?: number;
  price_range: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  restaurant_id: number;
  user_name: string;
  rating: number;
  comment?: string;
  menu_items?: string[];
  total_price?: number;
  created_at: string;
} 