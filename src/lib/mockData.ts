// 임시 Mock 데이터 (환경변수 설정 전까지 사용)
import { getStoredRestaurants } from './localStorage';

export interface MockStore {
  id: number;
  store_name: string;
  branch_name?: string;
  business_large_category: string;
  business_medium_category: string;
  business_small_category: string;
  road_address: string;
  latitude: number;
  longitude: number;
  mapped_category: string;
  restaurants?: {
    id: number;
    rating: number;
    price_range: string;
    menu_items: { name: string; price: number; is_popular: boolean }[];
    reviews: { rating: number }[];
    menu_board_image_url?: string;
  }[];
}

export const mockStores: MockStore[] = [
  {
    id: 1,
    store_name: "홍대돈까스",
    business_large_category: "음식점",
    business_medium_category: "일식",
    business_small_category: "돈까스전문점",
    road_address: "서울특별시 마포구 홍익로 123",
    latitude: 37.5547,
    longitude: 126.9236,
    mapped_category: "음식",
    restaurants: [{
      id: 1,
      rating: 4.5,
      price_range: "10,000-15,000원",
      menu_items: [
        { name: "왕돈까스", price: 12000, is_popular: true },
        { name: "치즈돈까스", price: 13000, is_popular: false }
      ],
      reviews: [{ rating: 4 }, { rating: 5 }]
    }]
  },
  {
    id: 2,
    store_name: "파스타킹",
    business_large_category: "음식점",
    business_medium_category: "양식",
    business_small_category: "파스타전문점",
    road_address: "서울특별시 마포구 홍익로 456",
    latitude: 37.5520,
    longitude: 126.9220,
    mapped_category: "음식"
  },
  {
    id: 3,
    store_name: "김치찌개집",
    business_large_category: "음식점",
    business_medium_category: "한식",
    business_small_category: "찌개전문점",
    road_address: "서울특별시 마포구 홍익로 789",
    latitude: 37.5565,
    longitude: 126.9210,
    mapped_category: "음식"
  },
  {
    id: 4,
    store_name: "홍대커피",
    business_large_category: "음식점",
    business_medium_category: "커피점/카페",
    business_small_category: "커피전문점",
    road_address: "서울특별시 마포구 와우산로 111",
    latitude: 37.5530,
    longitude: 126.9250,
    mapped_category: "카페"
  },
  {
    id: 5,
    store_name: "치킨플러스",
    business_large_category: "음식점",
    business_medium_category: "치킨전문점",
    business_small_category: "치킨전문점",
    road_address: "서울특별시 마포구 홍익로 321",
    latitude: 37.5540,
    longitude: 126.9190,
    mapped_category: "패스트푸드"
  },
  {
    id: 6,
    store_name: "홍대호프",
    business_large_category: "주점",
    business_medium_category: "호프/맥주",
    business_small_category: "호프",
    road_address: "서울특별시 마포구 어울마당로 222",
    latitude: 37.5560,
    longitude: 126.9180,
    mapped_category: "주점"
  }
];

// Mock 데이터 검색 함수 (로컬 저장 데이터와 결합)
export function getMockStores(options?: {
  category?: string;
  search?: string;
  sortBy?: 'name' | 'category';
  limit?: number;
}): Promise<MockStore[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 로컬 저장 데이터 불러오기 (클라이언트에서만)
      const storedRestaurants = getStoredRestaurants();

      // Mock 데이터와 저장된 데이터 결합
      let filteredStores = mockStores.map(store => {
        const storedData = storedRestaurants.find(r => r.public_store_id === store.id);
        
        if (storedData) {
          return {
            ...store,
            restaurants: [{
              id: parseInt(storedData.id.replace('restaurant_', '')),
              rating: storedData.rating || 0,
              price_range: storedData.price_range,
              menu_items: storedData.menu_items.map((item: any) => ({
                name: item.name,
                price: item.price,
                is_popular: item.is_popular
              })),
              reviews: storedData.reviews || [],
              menu_board_image_url: storedData.menu_board_image_url
            }]
          };
        }
        
        return store;
      });

      // 카테고리 필터
      if (options?.category && options.category !== 'all') {
        filteredStores = filteredStores.filter(store => 
          store.mapped_category === options.category
        );
      }

      // 검색 필터
      if (options?.search) {
        filteredStores = filteredStores.filter(store =>
          store.store_name.toLowerCase().includes(options.search!.toLowerCase())
        );
      }

      // 정렬
      if (options?.sortBy === 'name') {
        filteredStores.sort((a, b) => a.store_name.localeCompare(b.store_name));
      } else {
        filteredStores.sort((a, b) => a.mapped_category.localeCompare(b.mapped_category));
      }

      // 제한
      if (options?.limit) {
        filteredStores = filteredStores.slice(0, options.limit);
      }

      resolve(filteredStores);
    }, 300); // 0.3초 로딩 시뮬레이션
  });
} 