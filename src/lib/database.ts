import { supabase } from './supabase';
import type { Restaurant, MenuItem, Review } from './supabase';

export interface PublicStore {
  id: number;
  store_name: string;
  branch_name: string | null;
  business_large_category: string;
  business_medium_category: string;
  business_small_category: string;
  sido_name: string;
  sigungu_name: string;
  admin_dong_name: string;
  legal_dong_name: string;
  jibun_address: string;
  road_address: string;
  longitude: number;
  latitude: number;
  postal_code: string;
  mapped_category: string | null;
  created_at: string;
  updated_at: string;
}

// 공공데이터 상가 정보 조회 (음식점만)
export async function getPublicStores(options: {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'category';
  limit?: number;
  offset?: number;
} = {}): Promise<PublicStore[]> {
  let query = supabase
    .from('public_stores')
    .select('*')
    .eq('business_large_category', '음식'); // 음식 업종만 필터링

  // 검색어가 있으면 검색 (주소도 포함)
  if (options.search) {
    query = query.or(`store_name.ilike.%${options.search}%,road_address.ilike.%${options.search}%`);
  }

  if (options.category && options.category !== 'all') {
    query = query.eq('mapped_category', options.category);
  }

  if (options.sortBy === 'name') {
    query = query.order('store_name', { ascending: true });
  } else if (options.sortBy === 'category') {
    query = query.order('mapped_category', { ascending: true });
  } else {
    // 기본 정렬: 검색어가 있으면 관련도순, 없으면 인기순(랜덤)
    if (options.search) {
      query = query.order('store_name', { ascending: true });
    } else {
      // 인기 맛집 우선순위: 홍대 핫플레이스 키워드 포함된 곳들 우선
      // 그 다음 카테고리별로 고르게 분산
      query = query.order('store_name', { ascending: true });
    }
  }

  // limit과 offset 적용
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  } else {
    query = query.limit(options.limit || 100);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching public stores:', error);
    throw new Error('가게 정보를 불러오는 데 실패했습니다.');
  }

  return data as PublicStore[];
}

// 음식점 관련 함수들 (사용자 데이터)
export async function getRestaurants(options?: {
  category?: string;
  search?: string;
  sortBy?: 'rating' | 'reviews' | 'price' | 'name';
  limit?: number;
}) {
  let query = supabase
    .from('restaurants')
    .select(`
      *,
      public_stores(*),
      menu_items(id, name, price, is_popular),
      reviews(id, rating)
    `);

  // 카테고리 필터
  if (options?.category && options.category !== 'all') {
    query = query.eq('category', options.category);
  }

  // 검색 필터
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  // 정렬
  if (options?.sortBy) {
    switch (options.sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name');
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
  }

  // 제한
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }

  return data || [];
}

export async function getRestaurantById(id: number) {
  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      menu_items(*),
      reviews(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }

  return data;
}

export async function createRestaurant(restaurant: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();

  if (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }

  return data;
}

export async function updateRestaurant(id: number, updates: Partial<Restaurant>) {
  const { data, error } = await supabase
    .from('restaurants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }

  return data;
}

// 메뉴 아이템 관련 함수들
export async function getMenuItems(restaurantId: number) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('is_popular', { ascending: false })
    .order('name');

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return data || [];
}

export async function createMenuItem(menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(menuItem)
    .select()
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    throw error;
  }

  return data;
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>) {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }

  return data;
}

export async function deleteMenuItem(id: number) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
}

// 리뷰 관련 함수들
export async function getReviews(restaurantId: number) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }

  return data;
}

// 이미지 업로드 함수
export async function uploadImage(file: File, bucket: string = 'restaurant-images') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
} 