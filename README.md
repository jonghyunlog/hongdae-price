# 홍대 맛집 가격 🍽️

홍대 지역 맛집들의 실시간 메뉴와 가격 정보를 제공하는 웹 서비스입니다.

## 🚀 주요 기능

- 📍 **홍대 맛집 지도**: 카카오맵 기반 인터랙티브 지도
- 📋 **메뉴 등록**: 사용자가 직접 메뉴와 가격 정보 업로드
- 🔍 **검색 & 필터**: 카테고리별, 이름별 검색 기능
- 📱 **반응형 디자인**: 모바일/데스크톱 최적화
- 🖼️ **메뉴판 사진**: 실제 메뉴판 이미지 업로드 지원

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Maps**: Kakao Maps API
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/hongdae-price.git
cd hongdae-price
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 카카오 지도 API 키 (필수)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here

# Supabase 설정 (선택사항 - 나중에 사용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 카카오 지도 API 키 발급 방법:

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. "플랫폼" → "Web" 등록
4. "JavaScript 키" 복사
5. `.env.local` 파일에 `NEXT_PUBLIC_KAKAO_MAP_API_KEY=복사한_키` 추가

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🗺️ 카카오 지도 API 설정

### 1. API 키 발급
- [Kakao Developers Console](https://developers.kakao.com/console/app) 접속
- 새 애플리케이션 생성
- "플랫폼" → "Web" 등록
- 사이트 도메인에 `http://localhost:3000` 추가 (개발용)
- "JavaScript 키" 복사

### 2. 환경변수 설정
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY=여기에_복사한_키_입력
```

### 3. 배포 시 설정
- Vercel 등에 배포할 때 환경변수 추가
- 카카오 개발자 콘솔에서 도메인 추가 (예: `https://your-app.vercel.app`)

## 📱 사용 방법

### 메뉴 등록하기
1. 홈페이지에서 "맛집 목록" 클릭
2. 원하는 음식점 선택
3. "메뉴/가격 등록" 버튼 클릭
4. 메뉴명, 가격, 설명 입력
5. 메뉴판 사진 업로드 (선택사항)
6. "등록하기" 클릭

### 지도에서 확인하기
1. "지도보기" 메뉴 클릭
2. 좌측 목록에서 음식점 선택
3. 지도에서 마커 클릭하여 상세정보 확인

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `public_stores`: 공공데이터 상가 정보
- `restaurants`: 사용자 등록 음식점 정보
- `menu_items`: 메뉴 아이템
- `reviews`: 리뷰 및 평점

## 🚀 배포

### Vercel 배포
```bash
npm run build
vercel --prod
```

### 환경변수 설정 (배포 후)
- Vercel 대시보드 → Settings → Environment Variables
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 추가

## 📋 개발 계획

- [x] 기본 UI/UX 완성
- [x] 메뉴 등록 모달
- [x] 카카오 지도 연동
- [ ] Supabase DB 연동
- [ ] 공공데이터 연동
- [ ] 사용자 인증
- [ ] 리뷰 시스템
- [ ] 수익화 모델

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 📞 문의

- 이메일: your-email@example.com
- GitHub Issues: [이슈 등록](https://github.com/your-username/hongdae-price/issues)
