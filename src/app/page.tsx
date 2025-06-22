import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">홍</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">홍대 맛집 가격</h1>
          </div>
          <Button variant="outline">로그인</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            홍대 맛집의<br />
            <span className="text-orange-500">실시간 가격정보</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            사용자들이 직접 업데이트하는 최신 메뉴판과 가격 정보로
            바가지 걱정 없이 홍대 맛집을 즐기세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Search className="mr-2 h-4 w-4" />
                맛집 찾기
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button size="lg" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                가격 등록하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">왜 홍대 맛집 가격인가요?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>지역 특화</CardTitle>
                <CardDescription>
                  홍대 지역에 특화된 맛집 정보만 제공합니다
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>실시간 업데이트</CardTitle>
                <CardDescription>
                  사용자들이 직접 올리는 최신 가격 정보
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-orange-500 mb-2" />
                <CardTitle>커뮤니티 기반</CardTitle>
                <CardDescription>
                  홍대를 사랑하는 사람들이 함께 만드는 정보
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-orange-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">지금 시작해보세요</h3>
          <p className="text-gray-600 mb-8">
            당신의 홍대 맛집 경험을 다른 사람들과 공유해주세요
          </p>
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
            첫 번째 리뷰 작성하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 홍대 맛집 가격. 모든 권리 보유.</p>
        </div>
      </footer>
    </div>
  );
}
