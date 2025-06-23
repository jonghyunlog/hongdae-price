'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude: number;
  longitude: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title: string;
    content?: string;
  }>;
  onMarkerClick?: (marker: any) => void;
  zoom?: number;
}

export default function KakaoMap({
  width = '100%',
  height = '400px',
  latitude,
  longitude,
  markers = [],
  onMarkerClick,
  zoom = 3
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey || apiKey === 'your_kakao_map_api_key_here' || apiKey === '여기에_발급받은_API_키를_입력해주세요') {
      setError('카카오 지도 API 키가 설정되지 않았습니다.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 20;

    function initializeMap() {
      if (!isMounted || retryCount >= maxRetries) {
        if (retryCount >= maxRetries) {
          setError('지도 로드 시간이 초과되었습니다.');
        }
        setIsLoading(false);
        return;
      }
      
      retryCount++;
      
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!isMounted) return;
          
          if (!mapContainer.current) {
            timeoutId = setTimeout(initializeMap, 50);
            return;
          }
          
          try {
            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: zoom,
            };

            const map = new window.kakao.maps.Map(mapContainer.current, options);
            mapRef.current = map;

            // 마커들 추가
            markers.forEach((markerData) => {
              const markerPosition = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
              
              // 커스텀 마커 이미지 생성
              const svgString = `
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
                    <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">🍽️</text>
                  </svg>
                `;
              const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));

              const markerImage = new window.kakao.maps.MarkerImage(
                'data:image/svg+xml;base64,' + encodedSvg,
                new window.kakao.maps.Size(40, 40)
              );
              
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                title: markerData.title,
                image: markerImage,
              });

              marker.setMap(map);

              // 인포윈도우 생성
              if (markerData.content) {
                const infowindow = new window.kakao.maps.InfoWindow({
                  content: markerData.content,
                  removable: true,
                  zIndex: 1
                });

                // 마커 클릭 이벤트
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  infowindow.open(map, marker);
                  if (onMarkerClick) {
                    onMarkerClick(markerData);
                  }
                });
              }
            });

            setIsLoading(false);
          } catch (err) {
            console.error("카카오맵 초기화 오류:", err);
            setError('지도를 로드하는 중 오류가 발생했습니다.');
            setIsLoading(false);
          }
        });
      } else {
        timeoutId = setTimeout(initializeMap, 100);
      }
    }

    initializeMap();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [latitude, longitude, markers, zoom, onMarkerClick]);

  if (error) {
    const isApiKeyMissingError = error === '카카오 지도 API 키가 설정되지 않았습니다.';
    return (
      <div
        style={{ width, height }}
        className="rounded-lg border bg-gray-100 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600 mb-2">{error}</p>
          {isApiKeyMissingError ? (
            <p className="text-xs text-gray-400">
              .env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              API 키가 유효한지, 카카오 개발자 콘솔의 도메인 설정을 확인해주세요.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height }} className="relative">
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg border"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
} 