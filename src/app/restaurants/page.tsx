'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, Star, DollarSign, Map, Plus } from "lucide-react";
import Link from "next/link";
// import { getPublicStores } from "@/lib/database"; // 환경변수 설정 후 사용
import { getMockStores, type MockStore } from "@/lib/mockData";
import { addMenusToStore } from "@/lib/localStorage";
import KakaoMap from "@/components/KakaoMap";
import MenuRegistrationModal from "@/components/MenuRegistrationModal";

type PublicStore = MockStore;

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedStore, setSelectedStore] = useState<PublicStore | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getMockStores({
        search: searchTerm,
        category: category === 'all' ? undefined : category,
        sortBy: sortBy as 'name' | 'category',
        limit: 100
      });
      setStores(data);
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

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = category === "all" || store.mapped_category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">홍</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">홍대 맛집 가격</h1>
          </Link>
          <Button variant="outline">로그인</Button>
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
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              {showMap ? '목록 보기' : '지도 보기'}
            </Button>
          </div>
        </div>

        {showMap ? (
          /* Map View */
          <div className="space-y-6">
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">카카오맵 API 키 설정 후 지도가 표시됩니다</p>
                <p className="text-sm text-gray-500 mt-2">현재는 Mock 데이터로 테스트 중입니다</p>
              </div>
            </div>
            {/* 환경변수 설정 후 활성화
            <KakaoMap
              latitude={37.5519}
              longitude={126.9218}
              zoom={4}
              markers={filteredStores.map(store => ({
                lat: store.latitude,
                lng: store.longitude,
                title: store.store_name,
                content: `<strong>${store.store_name}</strong><br/>${store.mapped_category}<br/>${store.road_address}`
              }))}
              onMarkerClick={(marker) => {
                const store = filteredStores.find(s => s.store_name === marker.title);
                setSelectedStore(store || null);
              }}
            />
            */}
            
            {selectedStore && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{selectedStore.store_name}</CardTitle>
                  <CardDescription>{selectedStore.mapped_category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>주소:</strong> {selectedStore.road_address}</p>
                    <p className="text-sm"><strong>업종:</strong> {selectedStore.business_small_category}</p>
                    {selectedStore.restaurants && selectedStore.restaurants.length > 0 && (
                      <>
                        <p className="text-sm"><strong>평점:</strong> {selectedStore.restaurants[0].rating}/5</p>
                        <p className="text-sm"><strong>가격대:</strong> {selectedStore.restaurants[0].price_range}</p>
                        {selectedStore.restaurants![0].menu_board_image_url && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">메뉴판</p>
                            <img 
                              src={selectedStore.restaurants[0].menu_board_image_url} 
                              alt="메뉴판"
                              className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                                                 modal.innerHTML = `
                                   <div class="relative max-w-4xl max-h-full">
                                     <img src="${selectedStore.restaurants![0].menu_board_image_url}" alt="메뉴판 확대" class="max-w-full max-h-full object-contain rounded-lg">
                                     <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">✕</button>
                                   </div>
                                 `;
                                modal.onclick = (e) => {
                                  if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
                                    document.body.removeChild(modal);
                                  }
                                };
                                document.body.appendChild(modal);
                              }}
                            />
                          </div>
                        )}
                        {selectedStore.restaurants[0].menu_items?.find(m => m.is_popular) && (
                          <p className="text-sm"><strong>인기메뉴:</strong> {selectedStore.restaurants[0].menu_items.find(m => m.is_popular)?.name}</p>
                        )}
                      </>
                    )}
                    <div className="flex gap-2 pt-4">
                      <MenuRegistrationModal
                        storeName={selectedStore.store_name}
                        storeId={selectedStore.id}
                        onSubmit={async (menus) => {
                          console.log('메뉴 등록:', menus);
                          addMenusToStore(selectedStore.id, menus.map(m => ({
                            name: m.name,
                            price: typeof m.price === 'number' ? m.price : 0,
                            description: m.description,
                            is_popular: m.is_popular,
                            image: m.image
                          })));
                          alert(`${selectedStore.store_name}에 ${menus.length}개 메뉴가 등록되었습니다!`);
                          fetchStores(); // 목록 새로고침
                        }}
                        trigger={
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                            메뉴/가격 등록
                          </Button>
                        }
                      />
                      <Button size="sm" variant="outline">
                        리뷰 작성
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8">
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              filteredStores.map((store) => {
                const hasUserData = store.restaurants && store.restaurants.length > 0;
                const userRating = hasUserData ? store.restaurants![0].rating : null;
                const priceRange = hasUserData ? store.restaurants![0].price_range : null;
                const popularMenu = hasUserData ? store.restaurants![0].menu_items?.find(m => m.is_popular)?.name : null;
                const reviewCount = hasUserData ? store.restaurants![0].reviews?.length || 0 : 0;

                return (
                  <Card key={store.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{store.store_name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {store.mapped_category}
                          </CardDescription>
                        </div>
                        {hasUserData && userRating && (
                          <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-orange-500 mr-1" />
                            <span className="text-sm font-medium">{userRating}</span>
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
                            {/* 메뉴판 이미지 */}
                            {store.restaurants![0].menu_board_image_url && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-2">메뉴판</p>
                                <img 
                                  src={store.restaurants![0].menu_board_image_url} 
                                  alt="메뉴판"
                                  className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    const modal = document.createElement('div');
                                    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                    modal.innerHTML = `
                                      <div class="relative max-w-4xl max-h-full">
                                        <img src="${store.restaurants![0].menu_board_image_url}" alt="메뉴판 확대" class="max-w-full max-h-full object-contain rounded-lg">
                                        <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">✕</button>
                                      </div>
                                    `;
                                    modal.onclick = (e) => {
                                      if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
                                        document.body.removeChild(modal);
                                      }
                                    };
                                    document.body.appendChild(modal);
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* 등록된 메뉴 */}
                            {store.restaurants![0].menu_items && store.restaurants![0].menu_items.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-2">등록된 메뉴</p>
                                <div className="space-y-1">
                                  {store.restaurants![0].menu_items.slice(0, 3).map((menu, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                      <span className="text-sm text-gray-700">
                                        {menu.name}
                                        {menu.is_popular && <span className="ml-1 text-orange-500">★</span>}
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {menu.price.toLocaleString()}원
                                      </span>
                                    </div>
                                  ))}
                                  {store.restaurants![0].menu_items.length > 3 && (
                                    <p className="text-xs text-gray-500 pt-1">
                                                                              외 {store.restaurants![0].menu_items.length - 3}개 메뉴
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span className="text-sm">
                            {hasUserData ? (
                              <span className="text-green-600 font-medium">정보 등록됨</span>
                            ) : (
                              <span className="text-gray-500">정보 등록 필요</span>
                            )}
                          </span>
                          {reviewCount > 0 && (
                            <span>리뷰 {reviewCount}개</span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <MenuRegistrationModal
                            storeName={store.store_name}
                            storeId={store.id}
                            onSubmit={async (menus, menuBoardImage) => {
                              console.log('메뉴 등록:', menus);
                              addMenusToStore(store.id, menus.map(m => ({
                                name: m.name,
                                price: typeof m.price === 'number' ? m.price : 0,
                                description: m.description,
                                is_popular: m.is_popular,
                                image: m.image
                              })), menuBoardImage);
                              const imageText = menuBoardImage ? ' 및 메뉴판 사진' : '';
                              alert(`${store.store_name}에 ${menus.length}개 메뉴${imageText}가 등록되었습니다!`);
                              fetchStores(); // 목록 새로고침
                            }}
                            trigger={
                              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 flex-1">
                                <Plus className="h-4 w-4 mr-1" />
                                {hasUserData ? '정보 수정' : '메뉴/가격 등록'}
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

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
      </div>
    </div>
  );
} 