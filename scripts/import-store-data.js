require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 롤 키 사용
const supabase = createClient(supabaseUrl, supabaseKey);

// 홍대 지역 필터링 함수
function isHongdaeArea(address, adminDong) {
  const hongdaeKeywords = ['홍익', '홍대', '상수', '합정', '망원'];
  const addressStr = `${address} ${adminDong}`.toLowerCase();
  
  return hongdaeKeywords.some(keyword => 
    addressStr.includes(keyword) || 
    addressStr.includes('마포구')
  );
}

// 업종 카테고리 매핑
function mapBusinessCategory(largeCategory, mediumCategory, smallCategory) {
  const categoryMap = {
    '음식': ['한식', '중식', '일식', '양식', '아시아음식', '분식', '기타외국음식'],
    '카페': ['커피점/카페', '제과점'],
    '주점': ['호프/맥주', '일반유흥주점', '기타주점'],
    '패스트푸드': ['패스트푸드', '치킨전문점', '피자전문점'],
  };

  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => 
      mediumCategory.includes(keyword) || smallCategory.includes(keyword)
    )) {
      return category;
    }
  }
  
  return largeCategory || '기타';
}

async function importStoreData(csvFilePath) {
  const stores = [];
  let processedCount = 0;
  let hongdaeCount = 0;

  console.log('CSV 파일 읽기 시작...');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath, { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (row) => {
        processedCount++;
        
        // 홍대 지역 필터링
        if (isHongdaeArea(row['도로명주소'] || row['지번주소'], row['행정동명'])) {
          hongdaeCount++;
          
          const store = {
            store_name: row['상호명'],
            branch_name: row['지점명'] || null,
            business_large_category: row['상권업종대분류명'],
            business_medium_category: row['상권업종중분류명'],
            business_small_category: row['상권업종소분류명'],
            standard_industry_classification: row['표준산업분류명'],
            sido_name: row['시도명'],
            sigungu_name: row['시군구명'],
            admin_dong_name: row['행정동명'],
            legal_dong_name: row['법정동명'],
            jibun_address: row['지번주소'],
            road_address: row['도로명주소'],
            longitude: parseFloat(row['경도']) || null,
            latitude: parseFloat(row['위도']) || null,
            postal_code: row['우편번호'],
            mapped_category: mapBusinessCategory(
              row['상권업종대분류명'], 
              row['상권업종중분류명'], 
              row['상권업종소분류명']
            ),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // 좌표가 있는 경우만 추가
          if (store.longitude && store.latitude) {
            stores.push(store);
          }
        }

        // 진행상황 출력
        if (processedCount % 10000 === 0) {
          console.log(`처리된 행: ${processedCount}, 홍대지역 매장: ${hongdaeCount}`);
        }
      })
      .on('end', async () => {
        console.log(`CSV 파일 읽기 완료. 총 ${processedCount}행 처리, 홍대지역 ${stores.length}개 매장 발견`);
        
        try {
          // 기존 데이터 삭제 (선택사항)
          console.log('기존 상가 데이터 삭제 중...');
          await supabase.from('public_stores').delete().neq('id', 0);
          
          // 배치로 데이터 삽입 (1000개씩)
          const batchSize = 1000;
          for (let i = 0; i < stores.length; i += batchSize) {
            const batch = stores.slice(i, i + batchSize);
            console.log(`배치 ${Math.floor(i/batchSize) + 1} 삽입 중... (${i + 1} - ${Math.min(i + batchSize, stores.length)})`);
            
            const { error } = await supabase
              .from('public_stores')
              .insert(batch);
              
            if (error) {
              console.error('배치 삽입 오류:', error);
              throw error;
            }
          }
          
          console.log(`✅ 총 ${stores.length}개 매장 데이터 삽입 완료!`);
          resolve(stores.length);
        } catch (error) {
          console.error('데이터 삽입 오류:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('CSV 파일 읽기 오류:', error);
        reject(error);
      });
  });
}

// 스크립트 실행
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('사용법: node import-store-data.js <CSV_파일_경로>');
    console.error('예시: node import-store-data.js ./data/소상공인시장진흥공단_상가정보.csv');
    process.exit(1);
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`파일을 찾을 수 없습니다: ${csvFilePath}`);
    process.exit(1);
  }

  try {
    const importedCount = await importStoreData(csvFilePath);
    console.log(`🎉 데이터 import 성공! ${importedCount}개 매장 정보가 추가되었습니다.`);
  } catch (error) {
    console.error('❌ 데이터 import 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importStoreData }; 