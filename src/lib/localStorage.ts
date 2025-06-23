// 로컬 스토리지를 사용한 임시 데이터 저장

import { v4 as uuidv4 } from 'uuid';

interface StoredMenuItem {
  id: string;
  storeId: number;
  name: string;
  price: number;
  description: string;
  is_popular: boolean;
  image_url?: string;
  created_at: string;
}

export interface StoredRestaurant {
  id: number;
  public_store_id: number;
  rating: number | null;
  price_range: string;
  menu_items: StoredMenuItem[];
  reviews: { rating: number }[];
  menu_board_image_url?: string;
  created_at: string;
}

const STORAGE_KEY = 'hongdae-restaurants';

// 저장된 음식점 데이터 불러오기
export function getStoredRestaurants(): StoredRestaurant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 음식점 데이터 저장하기
export function saveStoredRestaurants(restaurants: StoredRestaurant[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

// 새 메뉴 등록 (Supabase만 사용)
export async function addMenusToStore(
  storeId: number,
  menuItems: Omit<MenuItem, 'id' | 'store_id'>[],
  menuBoardImage?: File
) {
  const { createRestaurant, createMenuItem, getPublicStores } = await import('./database');
  
  try {
    // 해당 public_store 정보 가져오기 (더 많은 데이터에서 찾기)
    const stores = await getPublicStores({ limit: 1000 });
    const publicStore = stores.find(s => s.id === storeId);
    
    if (!publicStore) {
      throw new Error('해당 가게를 찾을 수 없습니다.');
    }

    // 음식점 정보 생성
    const restaurantData = {
      public_store_id: storeId,
      name: publicStore.store_name,
      category: publicStore.mapped_category || '기타',
      address: publicStore.road_address,
      rating: undefined,
      price_range: '보통', // 기본값
    };

    let restaurantId: number;
    try {
      const restaurant = await createRestaurant(restaurantData);
      restaurantId = restaurant.id;
      console.log('✅ 음식점 정보 생성:', restaurant.name);
    } catch (error: any) {
      // 이미 존재하는 경우 에러 처리
      if (error.message?.includes('duplicate') || error.code === '23505') {
        console.log('음식점이 이미 존재합니다. 메뉴만 추가합니다.');
        // 기존 restaurant_id를 찾아야 함 - 임시로 에러 발생
        throw new Error('음식점이 이미 존재합니다. 기존 restaurant_id 조회 로직이 필요합니다.');
      }
      throw error;
    }

    // 메뉴 아이템들 저장
    for (const menuItem of menuItems) {
      await createMenuItem({
        restaurant_id: restaurantId,
        name: menuItem.name,
        price: menuItem.price,
        description: menuItem.description || '',
        is_popular: menuItem.is_popular,
      });
    }

    console.log(`✅ ${menuItems.length}개 메뉴 저장 완료`);
    return restaurantId;
  } catch (error) {
    console.error('❌ 메뉴 저장 실패:', error);
    throw error;
  }
}

// 특정 상가의 메뉴 불러오기
export function getMenusForStore(storeId: number): StoredMenuItem[] {
  const stored = getStoredRestaurants();
  const restaurant = stored.find(r => r.public_store_id === storeId);
  return restaurant ? restaurant.menu_items : [];
}

// 특정 상가의 음식점 정보 불러오기
export function getRestaurantForStore(storeId: number): StoredRestaurant | null {
  const stored = getStoredRestaurants();
  return stored.find(r => r.public_store_id === storeId) || null;
}

// 데이터 초기화 (개발용)
export function clearStoredData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// 기존 데이터의 rating 0을 null로 변경 (마이그레이션)
export function fixRatingData(): void {
  if (typeof window === 'undefined') return;
  
  const stored = getStoredRestaurants();
  const updated = stored.map(restaurant => ({
    ...restaurant,
    rating: restaurant.rating === 0 ? null : restaurant.rating
  }));
  
  saveStoredRestaurants(updated);
}

export interface MenuItem {
  id: string; // 로컬에서는 uuid 사용
  store_id: number;
  name: string;
  price: number;
  description: string;
  is_popular: boolean;
  image?: File;
  image_url?: string;
} 