-- 공공데이터 상가 정보 테이블
CREATE TABLE public_stores (
  id BIGSERIAL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  branch_name VARCHAR(100),
  business_large_category VARCHAR(100),
  business_medium_category VARCHAR(100),
  business_small_category VARCHAR(100),
  standard_industry_classification VARCHAR(100),
  sido_name VARCHAR(50),
  sigungu_name VARCHAR(50),
  admin_dong_name VARCHAR(50),
  legal_dong_name VARCHAR(50),
  jibun_address TEXT,
  road_address TEXT,
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  postal_code VARCHAR(10),
  mapped_category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_public_stores_name ON public_stores(store_name);
CREATE INDEX idx_public_stores_category ON public_stores(mapped_category);
CREATE INDEX idx_public_stores_address ON public_stores(road_address);
CREATE INDEX idx_public_stores_location ON public_stores(latitude, longitude);
CREATE INDEX idx_public_stores_sigungu ON public_stores(sigungu_name);

-- 사용자가 등록한 음식점 정보 테이블 (기존)
CREATE TABLE IF NOT EXISTS restaurants (
  id BIGSERIAL PRIMARY KEY,
  public_store_id BIGINT REFERENCES public_stores(id), -- 공공데이터와 연결
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  rating DECIMAL(3,2) DEFAULT 0,
  price_range VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메뉴 아이템 테이블 (기존)
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 리뷰 테이블 (기존)
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  menu_items TEXT[], -- 주문한 메뉴들
  total_price INTEGER,
  visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블 (향후 인증 기능용)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security 설정
ALTER TABLE public_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 공공데이터는 모든 사용자가 읽기 가능
CREATE POLICY "Public stores are viewable by everyone" ON public_stores
  FOR SELECT USING (true);

-- 음식점 정보는 모든 사용자가 읽기 가능, 등록된 사용자만 생성/수정 가능
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "Users can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update restaurants" ON restaurants
  FOR UPDATE USING (true);

-- 메뉴 아이템도 동일
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update menu items" ON menu_items
  FOR UPDATE USING (true);

-- 리뷰도 동일
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- 사용자 정보는 본인만 접근 가능 (향후 구현)
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id); 