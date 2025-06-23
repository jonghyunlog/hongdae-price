'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, DollarSign, List, Navigation } from "lucide-react";
import Link from "next/link";
import { getMockStores, MockStore } from '@/lib/mockData';
import KakaoMap from '@/components/KakaoMap';
import Script from 'next/script';

export default function MapPage() {
  const [stores, setStores] = useState<MockStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);

  // 환경변수 값 콘솔 출력 (진단용)
  // console.log('KAKAO KEY:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getMockStores({
        search: searchTerm,
        category: category === 'all' ? undefined : category,
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
  }, [searchTerm, category]);

  const filteredStores = useMemo(() => stores.filter(store => {
    const matchesSearch = store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = category === "all" || store.mapped_category === category;
    return matchesSearch && matchesCategory;
  }), [stores, searchTerm, category]);

  // 카카오 지도용 마커 데이터 변환
  const mapMarkers = useMemo(() => filteredStores.map(store => {
    const hasUserData = store.restaurants && store.restaurants.length > 0;
    const priceRange = hasUserData ? store.restaurants![0].price_range : null;
    const menuCount = hasUserData ? store.restaurants![0].menu_items?.length || 0 : 0;
    
    return {
      lat: store.latitude,
      lng: store.longitude,
      title: store.store_name,
      content: `
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${store.store_name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${store.mapped_category}</div>
          ${priceRange ? `<div style="font-size: 12px; color: #28a745;">💰 ${priceRange}</div>` : ''}
          ${menuCount > 0 ? `<div style="font-size: 12px; color: #007bff;">📋 메뉴 ${menuCount}개</div>` : ''}
          <div style="font-size: 11px; color: #999; margin-top: 4px;">${store.road_address}</div>
        </div>
      `
    };
  }), [filteredStores]);

  const handleMarkerClick = useCallback((marker: any) => {
    const store = filteredStores.find(s => 
      s.latitude === marker.lat && s.longitude === marker.lng
    );
    if (store) {
      setSelectedStore(store);
    }
  }, [filteredStores]);

  // 홍대 중심 좌표
  const hongdaeCenter = { lat: 37.5563, lng: 126.9236 };

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`}
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">홍</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">홍대 맛집지도</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/restaurants">
                <Button variant="outline" size="sm">
                  <List className="h-4 w-4 mr-1" />
                  목록보기
                </Button>
              </Link>
              <Button variant="outline" size="sm">로그인</Button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* 좌측 검색 패널 */}
          <div className="w-80 bg-white border-r flex flex-col">
            {/* 검색 영역 */}
            <div className="p-4 border-b">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="음식점 이름을 검색하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
              </div>
            </div>

            {/* 결과 목록 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  총 {filteredStores.length}개 맛집
                </p>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">검색 중...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStores.map((store) => {
                      const hasUserData = store.restaurants && store.restaurants.length > 0;
                      const userRating = hasUserData ? store.restaurants![0].rating : null;
                      const priceRange = hasUserData ? store.restaurants![0].price_range : null;
                      
                      return (
                        <Card 
                          key={store.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedStore?.id === store.id ? 'ring-2 ring-orange-500' : ''
                          }`}
                          onClick={() => setSelectedStore(store)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{store.store_name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {store.mapped_category}
                                </CardDescription>
                              </div>
                              {hasUserData && userRating && userRating > 0 && (
                                <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 text-orange-500 mr-1" />
                                  <span className="text-xs font-medium">{userRating}</span>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">{store.road_address}</span>
                              </div>
                              
                              {priceRange && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  <span>{priceRange}</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs">
                                  {hasUserData ? (
                                    <span className="text-green-600 font-medium">가격정보 있음</span>
                                  ) : (
                                    <span className="text-gray-500">가격정보 없음</span>
                                  )}
                                </span>
                                {hasUserData && store.restaurants![0].menu_board_image_url && (
                                  <span className="text-xs text-blue-600">메뉴판 있음</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 우측 지도 영역 */}
          <div className="flex-1 relative">
            <KakaoMap
              width="100%"
              height="100%"
              latitude={hongdaeCenter.lat}
              longitude={hongdaeCenter.lng}
              markers={mapMarkers}
              zoom={4}
              onMarkerClick={handleMarkerClick}
            />

            {/* 선택된 가게 정보 카드 */}
            {selectedStore && (
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{selectedStore.store_name}</h3>
                    <p className="text-sm text-gray-600">{selectedStore.mapped_category}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedStore(null)}
                    variant="ghost"
                    className="text-gray-500"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedStore.road_address}</span>
                  </div>
                  
                  {selectedStore.restaurants && selectedStore.restaurants.length > 0 && (
                    <>
                      {selectedStore.restaurants[0].price_range && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>{selectedStore.restaurants[0].price_range}</span>
                        </div>
                      )}
                      
                      {selectedStore.restaurants[0].menu_board_image_url && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-2">메뉴판</h4>
                          <img 
                            src={selectedStore.restaurants[0].menu_board_image_url}
                            alt="메뉴판" 
                            className="w-full h-32 object-cover rounded cursor-pointer"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              console.warn('메뉴판 이미지 로드 실패');
                            }}
                            onClick={() => {
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                              modal.innerHTML = `<img src="${selectedStore.restaurants![0].menu_board_image_url}" alt="메뉴판 확대" class="max-w-full max-h-full object-contain rounded-lg">`;
                              modal.onclick = () => modal.remove();
                              document.body.appendChild(modal);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/restaurants?store=${selectedStore.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                      상세정보
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    길찾기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 