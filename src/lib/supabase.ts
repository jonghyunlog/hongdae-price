import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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