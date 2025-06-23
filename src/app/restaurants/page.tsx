'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, DollarSign, Map, Plus } from "lucide-react";
import Link from "next/link";
import { getPublicStores, type PublicStore } from "@/lib/database";
// import { getMockStores, type MockStore } from "@/lib/mockData";
import { addMenusToStore, type MenuItem } from "@/lib/localStorage";
import { getRestaurants } from "@/lib/database";
// import KakaoMap from "@/components/KakaoMap";
import MenuRegistrationModal from "@/components/MenuRegistrationModal";

interface DisplayStore extends PublicStore {
  restaurants?: any[]; // DB에서 가져온 restaurant 데이터
}

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [stores, setStores] = useState<DisplayStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<DisplayStore | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      // 검색어가 있으면 검색 결과만, 없으면 일반 목록
      const limit = searchTerm ? 100 : 50; // 검색시 100개, 일반시 50개
      
      const publicStores = await getPublicStores({
        search: searchTerm || undefined,
        category: category === 'all' ? undefined : category,
        sortBy: sortBy as 'name' | 'category',
        limit: limit
      });

      // DB에서 사용자가 등록한 음식점 데이터 가져오기
      const dbRestaurants = await getRestaurants({ limit: 1000 });

      const combinedStores: DisplayStore[] = publicStores.map((store) => {
        const matchingRestaurants = dbRestaurants.filter(
          (r: any) => r.public_store_id === store.id
        );
        return {
          ...store,
          restaurants: matchingRestaurants,
        };
      });

      setStores(combinedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, category, sortBy]);

  const filteredStores = useMemo(() => {
    // 서버에서 이미 검색/필터링/정렬되어 오므로 그대로 사용
    return stores;
  }, [stores]);

  const handleMenuSubmit = async (menus: Omit<MenuItem, 'id' | 'store_id'>[], menuBoardImage?: File) => {
    if (selectedStore) {
      console.log('메뉴 등록:', menus, menuBoardImage);
      
      try {
        await addMenusToStore(
          selectedStore.id, 
          menus.map(m => ({
            name: m.name,
            price: typeof m.price === 'number' ? m.price : 0,
            description: m.description,
            is_popular: m.is_popular,
            image: m.image
          })),
          menuBoardImage
        );
        
        const imageText = menuBoardImage ? ' 및 메뉴판 사진' : '';
        alert(`${selectedStore.store_name}에 ${menus.length}개 메뉴${imageText}가 등록되었습니다!`);
        
        await fetchStores(); // 목록 새로고침
        setSelectedStore(null); // 모달 닫기
      } catch (error) {
        console.error('메뉴 등록 실패:', error);
        alert('메뉴 등록 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">홍</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">맛집 목록</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/map">
              <Button variant="outline" size="sm">
                <Map className="h-4 w-4 mr-1" />
                지도로 보기
              </Button>
            </Link>
            <Button variant="outline" size="sm">로그인</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-6">홍대 맛집 찾기</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="음식점 이름을 검색하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="음식">음식</SelectItem>
                <SelectItem value="카페">카페</SelectItem>
                <SelectItem value="주점">주점</SelectItem>
                <SelectItem value="패스트푸드">패스트푸드</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="category">카테고리순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            총 {filteredStores.length}개의 맛집을 찾았습니다
          </h3>
        </div>

        {/* List View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              filteredStores.map((store) => {
                const hasUserData =
                  store.restaurants && store.restaurants.length > 0;
                const userRating = hasUserData
                  ? store.restaurants![0].rating
                  : null;
                const priceRange = hasUserData
                  ? store.restaurants![0].price_range
                  : null;
                const reviewCount = hasUserData
                  ? store.restaurants![0].reviews?.length || 0
                  : 0;

                return (
                  <Card
                    key={store.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {store.store_name}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {store.mapped_category}
                          </CardDescription>
                        </div>
                        {hasUserData &&
                          userRating !== null &&
                          userRating !== undefined &&
                          userRating > 0 && (
                            <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                              <Star className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-sm font-medium">
                                {userRating}
                              </span>
                            </div>
                          )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{store.road_address}</span>
                        </div>

                        {priceRange && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>{priceRange}</span>
                          </div>
                        )}

                        {hasUserData && (
                          <div className="space-y-3">
                            {/* 등록된 메뉴 표시 */}
                            {store.restaurants![0].menu_items && store.restaurants![0].menu_items.length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-green-800 mb-2">
                                  등록된 메뉴 ({store.restaurants![0].menu_items.length}개)
                                </p>
                                <div className="space-y-1">
                                  {store.restaurants![0].menu_items.slice(0, 3).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">
                                        {item.name}
                                        {item.is_popular && <span className="text-orange-500 ml-1">★</span>}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {item.price.toLocaleString()}원
                                      </span>
                                    </div>
                                  ))}
                                  {store.restaurants![0].menu_items.length > 3 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      외 {store.restaurants![0].menu_items.length - 3}개 메뉴
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {store.restaurants![0].menu_board_image_url && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  메뉴판
                                </p>
                                <img
                                  src={
                                    store.restaurants![0].menu_board_image_url
                                  }
                                  alt="메뉴판"
                                  className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      console.warn('Blob URL or invalid image skipped for store ID:', store.id);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Card의 onClick 방지
                                    const modal = document.createElement('div');
                                    modal.className =
                                      'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                    modal.innerHTML = `
                                      <div class="relative max-w-4xl max-h-full">
                                        <img src="${
                                          store.restaurants![0]
                                            .menu_board_image_url
                                        }" alt="메뉴판 확대" class="max-w-full max-h-full object-contain rounded-lg">
                                        <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">✕</button>
                                      </div>
                                    `;
                                    modal.onclick = (ev) => {
                                      if (
                                        ev.target === modal ||
                                        (ev.target as HTMLElement).tagName ===
                                          'BUTTON'
                                      ) {
                                        document.body.removeChild(modal);
                                      }
                                    };
                                    document.body.appendChild(modal);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                          <span className="text-sm mt-2">
                            {hasUserData ? (
                              <span className="text-green-600 font-medium">
                                정보 등록됨
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                정보 등록 필요
                              </span>
                            )}
                          </span>
                          {reviewCount > 0 && (
                            <span className="mt-2">리뷰 {reviewCount}개</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                       <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600" onClick={(e) => { e.stopPropagation(); setSelectedStore(store); }}>
                          <Plus className="h-4 w-4 mr-1" />
                          {hasUserData && store.restaurants![0].menu_items?.length > 0 ? '메뉴 추가/수정' : '메뉴/가격 등록'}
                       </Button>
                    </div>
                  </Card>
                );
              })
            )}
        </div>

        {/* Empty State */}
        {!loading && filteredStores.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">다른 검색어를 시도해보세요</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setCategory("all");
            }}>
              전체 목록 보기
            </Button>
          </div>
        )}

        {selectedStore && (
          <MenuRegistrationModal
            storeName={selectedStore.store_name}
            storeId={selectedStore.id}
            onSubmit={handleMenuSubmit}
            onClose={() => setSelectedStore(null)}
            isOpen={!!selectedStore}
          />
        )}
      </div>
    </div>
  );
} 