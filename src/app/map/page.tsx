'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, DollarSign, List, Navigation, X } from "lucide-react";
import Link from "next/link";
import { getPublicStores, getRestaurants, type PublicStore } from '@/lib/database';
// import { getMockStores } from '@/lib/mockData'; // 임시 데이터 사용 중단
import KakaoMap, { type MapMarker } from '@/components/KakaoMap';
import Script from 'next/script';

export default function MapPage() {
  interface DisplayStore extends PublicStore {
    restaurants?: any[]; // DB에서 가져온 restaurant 데이터
  }
  
  const [stores, setStores] = useState<DisplayStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedStore, setSelectedStore] = useState<DisplayStore | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 페이지 로드 시 스크립트가 이미 로드되어 있는지 확인
  useEffect(() => {
    const checkScript = () => {
      if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
        setIsScriptLoaded(true);
        return true;
      }
      return false;
    };

    // 즉시 확인
    if (checkScript()) return;

    // 스크립트가 없으면 주기적으로 확인 (최대 3초)
    const interval = setInterval(() => {
      if (checkScript()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  const [showMore, setShowMore] = useState(false);

  // 환경변수 값 콘솔 출력 (진단용)
  // console.log('KAKAO KEY:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      // 검색어가 있으면 검색 결과, 없으면 인기 맛집 소수만
      let limit = 10; // 기본 10개
      if (searchTerm) {
        limit = 50; // 검색시 50개
      } else if (showMore) {
        limit = 100; // 더보기 클릭시 100개
      }
      
      const publicStores = await getPublicStores({ 
        search: searchTerm || undefined,
        category: category === 'all' ? undefined : category,
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
      console.error('Failed to fetch stores', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, category, showMore]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const filteredStores = useMemo(() => {
    // 서버에서 이미 필터링되어 오므로 그대로 사용
    return stores;
  }, [stores]);

  const mapMarkers: MapMarker[] = useMemo(() => {
    return filteredStores.map((store) => ({
      lat: store.latitude,
      lng: store.longitude,
      label: store.store_name,
      category: store.mapped_category || '기타',
    }));
  }, [filteredStores]);

  const handleMarkerClick = useCallback(
    (markerData: MapMarker) => {
      const store = stores.find(
        (s) => s.latitude === markerData.lat && s.longitude === markerData.lng
      );
      if (store) {
        setSelectedStore(store);
        if (!isSidebarOpen) {
          setIsSidebarOpen(true);
        }
      }
    },
    [stores, isSidebarOpen]
  );
  
  const categories = useMemo(() => {
    const categorySet = new Set(stores.map(s => s.mapped_category).filter(Boolean) as string[]);
    return ['all', ...Array.from(categorySet).sort()];
  }, [stores]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <div className="relative h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <div
          className={`absolute md:relative top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-full md:w-96 bg-white shadow-lg flex flex-col`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">가게 목록</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="가게 이름 또는 주소 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4 bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'all' ? '모든 카테고리' : c}</option>
                ))}
            </select>
          </div>

          <div className="flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">가게 목록을 불러오는 중...</p>
              </div>
            ) : (
              <>
                <ul>
                  {filteredStores.map((store) => (
                    <li
                      key={store.id}
                      className={`p-4 cursor-pointer hover:bg-gray-100 ${
                        selectedStore?.id === store.id ? 'bg-orange-100' : ''
                      }`}
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{store.store_name}</h3>
                          <p className="text-sm text-gray-600">
                            {store.mapped_category}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {store.road_address}
                          </p>
                        </div>
                        {store.restaurants && store.restaurants.length > 0 && (
                          <div className="flex items-center bg-orange-100 px-2 py-1 rounded-full ml-2">
                            <Star className="h-3 w-3 text-orange-500 mr-1" />
                            <span className="text-xs font-medium text-orange-700">메뉴등록</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* 더 보기 버튼 */}
                {!searchTerm && !showMore && (
                  <div className="p-4 text-center border-t">
                    <button
                      onClick={() => setShowMore(true)}
                      className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      더 많은 맛집 보기 ({filteredStores.length}/100+)
                    </button>
                  </div>
                )}
                
                {showMore && (
                  <div className="p-4 text-center border-t">
                    <p className="text-sm text-gray-500">
                      총 {filteredStores.length}개 맛집 표시 중
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 h-full relative">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-4 left-4 z-10 bg-white p-2 rounded-full shadow-md md:hidden"
            >
              <List className="h-6 w-6" />
            </button>
          )}

          {isScriptLoaded ? (
            <KakaoMap
              latitude={37.5559}
              longitude={126.9238}
              markers={mapMarkers}
              onMarkerClick={handleMarkerClick}
              zoom={5}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">지도 API 로딩 중...</p>
              </div>
            </div>
          )}
          
          {selectedStore && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white p-4 rounded-lg shadow-lg z-10 max-h-[60vh] overflow-y-auto">
               <button 
                onClick={() => setSelectedStore(null)} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-bold mb-2">{selectedStore.store_name}</h3>
              <p className="text-gray-600">{selectedStore.mapped_category}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{selectedStore.road_address}</span>
              </div>
              
              {/* 메뉴 정보 표시 */}
              {selectedStore.restaurants && selectedStore.restaurants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {/* 등록된 메뉴 목록 */}
                  {selectedStore.restaurants[0].menu_items && selectedStore.restaurants[0].menu_items.length > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-800">
                          등록된 메뉴 ({selectedStore.restaurants[0].menu_items.length}개)
                        </span>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedStore.restaurants[0].menu_items.map((item: any, idx: number) => (
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
                      </div>
                    </div>
                  )}
                  
                  {/* 메뉴판 이미지 */}
                  {selectedStore.restaurants[0].menu_board_image_url && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">메뉴판</p>
                      <img
                        src={selectedStore.restaurants[0].menu_board_image_url}
                        alt="메뉴판"
                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const modal = document.createElement('div');
                          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                          modal.innerHTML = `
                            <div class="relative max-w-4xl max-h-full">
                              <img src="${selectedStore.restaurants![0].menu_board_image_url}" alt="메뉴판 확대" class="max-w-full max-h-full object-contain rounded-lg">
                              <button class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">✕</button>
                            </div>
                          `;
                          modal.onclick = (ev) => {
                            if (ev.target === modal || (ev.target as HTMLElement).tagName === 'BUTTON') {
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
              
              <div className="mt-4 text-center">
                <Link href={`/restaurants?store=${selectedStore.id}`} legacyBehavior>
                  <a className="text-orange-500 hover:underline font-semibold">
                    {selectedStore.restaurants && selectedStore.restaurants.length > 0 
                      ? '메뉴 추가/수정하기' 
                      : '메뉴 등록하기'
                    }
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 