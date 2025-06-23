'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  category?: string;
}

interface KakaoMapProps {
  markers: MapMarker[];
  onMarkerClick?: (markerData: MapMarker) => void;
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: string;
  height?: string;
}

export default function KakaoMap({
  markers,
  onMarkerClick,
  latitude,
  longitude,
  zoom = 5,
  width = '100%',
  height = '100%',
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = () => {
      if (!isMounted || !mapContainer.current) return;

      // 카카오 API 확인
      if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!isMounted || !mapContainer.current) return;
          
          try {
            // 기존 지도 정리
            if (clustererRef.current) {
              clustererRef.current.clear();
            }
            
            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: zoom,
            };
            
            const map = new window.kakao.maps.Map(mapContainer.current, options);
            mapRef.current = map;
            
            // 클러스터러 생성
            const clusterer = new window.kakao.maps.MarkerClusterer({
              map: map,
              averageCenter: true,
              minLevel: 6
            });
            clustererRef.current = clusterer;

            // 마커 생성
            if (markers.length > 0) {
              const mapMarkers = markers.map((markerData) => {
                const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
                const marker = new window.kakao.maps.Marker({
                  position: position,
                  title: markerData.label
                });
                
                if (onMarkerClick) {
                  window.kakao.maps.event.addListener(marker, 'click', () => {
                    onMarkerClick(markerData);
                  });
                }
                
                return marker;
              });

              clusterer.addMarkers(mapMarkers);
            }
            
            setIsLoading(false);
            setError(null);
          } catch (err) {
            console.error("카카오맵 초기화 오류:", err);
            setError('지도를 초기화하는 중 오류가 발생했습니다.');
            setIsLoading(false);
          }
        });
      } else {
        // API가 아직 완전히 로드되지 않았으면 잠시 후 재시도
        setTimeout(initializeMap, 100);
      }
    };

    // 초기화 시작
    const timeoutId = setTimeout(initializeMap, 100); // 약간의 지연 후 시작

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (clustererRef.current) {
        clustererRef.current.clear();
      }
    };
  }, [latitude, longitude, zoom, markers, onMarkerClick]);

  if (error) {
    return (
      <div style={{ width, height }} className="rounded-lg border bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="font-semibold text-red-500">지도 로딩 오류</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height }} className="relative">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">지도 초기화 중...</p>
          </div>
        </div>
      )}
    </div>
  );
} 