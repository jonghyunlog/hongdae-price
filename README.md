# 홍대 맛집 가격 정보 서비스

홍대 지역의 맛집 메뉴와 가격 정보를 사용자들이 직접 등록하고 공유하는 웹 서비스입니다.

## 🚀 주요 기능

- **실시간 가격 정보**: 사용자들이 직접 업데이트하는 최신 메뉴판과 가격
- **지도 기반 검색**: 카카오맵을 활용한 위치 기반 맛집 검색
- **공공데이터 연동**: 소상공인시장진흥공단 상가 정보와 연계
- **사용자 리뷰**: 실제 방문 후기와 가격 정보 공유

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Components**: shadcn/ui, Radix UI
- **Map**: Kakao Map API
- **Data Source**: 공공데이터포털 (소상공인시장진흥공단)

## 🏗 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

### 3. 데이터베이스 설정
Supabase에서 `sql/create_tables.sql` 파일을 실행하여 테이블을 생성하세요.

### 4. 공공데이터 가져오기

#### 4.1 CSV 파일 다운로드
1. [공공데이터포털](https://www.data.go.kr/data/15083033/fileData.do)에서 **소상공인시장진흥공단_상가(상권)정보** CSV 파일을 다운로드
2. 프로젝트 루트에 `data` 폴더 생성 후 CSV 파일 저장

#### 4.2 데이터 import 실행
```bash
# CSV 파일을 데이터베이스에 import
npm run import-stores data/소상공인시장진흥공단_상가정보.csv

# 또는 직접 실행
node scripts/import-store-data.js data/소상공인시장진흥공단_상가정보.csv
```

### 5. 개발 서버 실행
```bash
npm run dev
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js 앱 라우터
│   ├── page.tsx           # 메인 페이지
│   └── restaurants/       # 맛집 관련 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── KakaoMap.tsx      # 카카오맵 컴포넌트
└── lib/                  # 유틸리티 및 라이브러리
    ├── supabase.ts       # Supabase 클라이언트
    ├── database.ts       # 데이터베이스 함수
    └── publicData.ts     # 공공데이터 처리

scripts/
└── import-store-data.js   # 공공데이터 import 스크립트

sql/
└── create_tables.sql      # 데이터베이스 스키마
```

## 🗄 데이터베이스 스키마

### `public_stores` - 공공데이터 상가 정보
- 소상공인시장진흥공단에서 제공하는 전국 상가업소 데이터
- 홍대 지역 필터링하여 저장
- 상호명, 업종, 주소, 좌표 등

### `restaurants` - 사용자 등록 음식점 정보
- 사용자가 추가한 메뉴/가격 정보
- `public_stores`와 연결

### `menu_items` - 메뉴 아이템
- 각 음식점의 메뉴와 가격
- 이미지 업로드 지원

### `reviews` - 사용자 리뷰
- 평점, 후기, 실제 결제 금액 등

## 🎯 주요 컨셉

1. **공공데이터 활용**: 정확한 상가 정보를 기반으로 서비스 구축
2. **사용자 참여**: 커뮤니티 기반으로 최신 정보 유지
3. **지역 특화**: 홍대 지역에 특화된 맛집 정보
4. **실용성**: 실제 가격과 메뉴 정보 중심

## 🚧 개발 계획

### Phase 1 (현재)
- [x] 기본 프로젝트 구조
- [x] 공공데이터 연동
- [x] 지도 기능
- [ ] 메뉴/가격 등록 기능

### Phase 2
- [ ] 사용자 인증
- [ ] 이미지 업로드
- [ ] 리뷰 시스템

### Phase 3
- [ ] 추천 알고리즘
- [ ] 모바일 앱 (하이브리드)
- [ ] 수익화 모델

## �� 라이선스

MIT License
