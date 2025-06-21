'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: zoom,
          };

          const map = new window.kakao.maps.Map(mapContainer.current, options);
          mapRef.current = map;

          // 마커들 추가
          markers.forEach((markerData) => {
            const markerPosition = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
            
            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              title: markerData.title,
            });

            marker.setMap(map);

            // 인포윈도우 생성
            if (markerData.content) {
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${markerData.content}</div>`,
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
        }
      });
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [latitude, longitude, markers, zoom, onMarkerClick]);

  return (
    <div
      ref={mapContainer}
      style={{ width, height }}
      className="rounded-lg border"
    />
  );
} 