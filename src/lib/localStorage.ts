// 로컬 스토리지를 사용한 임시 데이터 저장

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

interface StoredRestaurant {
  id: string;
  public_store_id: number;
  rating: number;
  price_range: string;
  menu_items: StoredMenuItem[];
  reviews: any[];
  menu_board_image_url?: string;
  created_at: string;
}

const STORAGE_KEY = 'hongdae-restaurants';

// 저장된 음식점 데이터 불러오기
export function getStoredRestaurants(): StoredRestaurant[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stored restaurants:', error);
    return [];
  }
}

// 음식점 데이터 저장하기
export function saveStoredRestaurants(restaurants: StoredRestaurant[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
  } catch (error) {
    console.error('Error saving restaurants:', error);
  }
}

// 새 메뉴 등록
export function addMenusToStore(storeId: number, menus: {
  name: string;
  price: number;
  description: string;
  is_popular: boolean;
  image?: File;
}[], menuBoardImage?: File): void {
  const stored = getStoredRestaurants();
  let restaurant = stored.find(r => r.public_store_id === storeId);

  // 새 메뉴 아이템들 생성
  const newMenuItems: StoredMenuItem[] = menus.map(menu => ({
    id: `menu_${Date.now()}_${Math.random()}`,
    storeId: storeId,
    name: menu.name,
    price: menu.price,
    description: menu.description,
    is_popular: menu.is_popular,
    image_url: menu.image ? URL.createObjectURL(menu.image) : undefined,
    created_at: new Date().toISOString()
  }));

  // 메뉴판 이미지 처리
  const menuBoardImageUrl = menuBoardImage ? URL.createObjectURL(menuBoardImage) : undefined;

  if (restaurant) {
    // 기존 음식점에 메뉴 추가
    restaurant.menu_items.push(...newMenuItems);
    
    // 메뉴판 이미지 업데이트 (새 이미지가 있을 때만)
    if (menuBoardImageUrl) {
      restaurant.menu_board_image_url = menuBoardImageUrl;
    }
    
    // 가격대 업데이트
    const prices = restaurant.menu_items.map(m => m.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    restaurant.price_range = `${minPrice.toLocaleString()}-${maxPrice.toLocaleString()}원`;
  } else {
    // 새 음식점 생성
    const prices = newMenuItems.map(m => m.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    restaurant = {
      id: `restaurant_${Date.now()}`,
      public_store_id: storeId,
      rating: 0,
      price_range: `${minPrice.toLocaleString()}-${maxPrice.toLocaleString()}원`,
      menu_items: newMenuItems,
      reviews: [],
      menu_board_image_url: menuBoardImageUrl,
      created_at: new Date().toISOString()
    };
    stored.push(restaurant);
  }

  saveStoredRestaurants(stored);
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