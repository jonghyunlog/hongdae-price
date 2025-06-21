'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Camera } from "lucide-react";

interface MenuItem {
  name: string;
  price: number | '';
  description: string;
  is_popular: boolean;
  image?: File;
}

interface MenuRegistrationModalProps {
  storeName: string;
  storeId: number;
  existingMenus?: MenuItem[];
  onSubmit: (menus: MenuItem[], menuBoardImage?: File) => Promise<void>;
  trigger: React.ReactNode;
}

export default function MenuRegistrationModal({
  storeName,
  storeId,
  existingMenus = [],
  onSubmit,
  trigger
}: MenuRegistrationModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuBoardImage, setMenuBoardImage] = useState<File | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>(
    existingMenus.length > 0 
      ? existingMenus 
      : [{ name: '', price: '', description: '', is_popular: false }]
  );

  const addMenu = () => {
    setMenus([...menus, { name: '', price: '', description: '', is_popular: false }]);
  };

  const removeMenu = (index: number) => {
    if (menus.length > 1) {
      setMenus(menus.filter((_, i) => i !== index));
    }
  };

  const updateMenu = (index: number, field: keyof MenuItem, value: any) => {
    const updated = [...menus];
    updated[index] = { ...updated[index], [field]: value };
    setMenus(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const validMenus = menus.filter(menu => menu.name && menu.price);
    
    // 메뉴판 사진이 있으면 메뉴 정보는 선택사항
    if (validMenus.length === 0 && !menuBoardImage) {
      alert('메뉴판 사진 또는 메뉴 정보 중 하나는 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(validMenus, menuBoardImage || undefined);
      setOpen(false);
      // 성공 후 폼 리셋
      setMenus([{ name: '', price: '', description: '', is_popular: false }]);
      setMenuBoardImage(null);
    } catch (error) {
      console.error('메뉴 등록 실패:', error);
      alert('메뉴 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">메뉴 & 가격 등록</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-orange-600">{storeName}</span>의 메뉴와 가격 정보를 등록해주세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 메뉴판 사진 업로드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">메뉴판 사진</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="menu-board-image" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                                             <span className="text-sm font-medium text-gray-900">
                         메뉴판 사진 업로드
                       </span>
                       <span className="text-xs text-gray-500 mt-1">
                         메뉴판 사진만 올려도 됩니다! 아래 메뉴 정보는 선택사항입니다.
                       </span>
                    </div>
                  </Label>
                  <input
                    type="file"
                    id="menu-board-image"
                    accept="image/*"
                    onChange={(e) => setMenuBoardImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
                {menuBoardImage && (
                  <div className="mt-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <Camera className="h-4 w-4 mr-2" />
                      {menuBoardImage.name}
                    </div>
                    <Button
                      type="button"
                      onClick={() => setMenuBoardImage(null)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 메뉴 리스트 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">메뉴 정보</h3>
                <p className="text-sm text-gray-600">메뉴판 사진이 있다면 선택사항입니다</p>
              </div>
              <Button type="button" onClick={addMenu} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                메뉴 추가
              </Button>
            </div>

            {menus.map((menu, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">메뉴 {index + 1}</CardTitle>
                    {menus.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMenu(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 메뉴명 */}
                    <div className="space-y-2">
                      <Label htmlFor={`menu-name-${index}`}>메뉴명</Label>
                      <Input
                        id={`menu-name-${index}`}
                        value={menu.name}
                        onChange={(e) => updateMenu(index, 'name', e.target.value)}
                        placeholder="김치찌개"
                      />
                    </div>
                    
                    {/* 가격 */}
                    <div className="space-y-2">
                      <Label htmlFor={`menu-price-${index}`}>가격 (원)</Label>
                      <Input
                        id={`menu-price-${index}`}
                        type="number"
                        value={menu.price}
                        onChange={(e) => updateMenu(index, 'price', e.target.value ? Number(e.target.value) : '')}
                        placeholder="9000"
                      />
                    </div>
                  </div>

                  {/* 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor={`menu-description-${index}`}>메뉴 설명</Label>
                    <Textarea
                      id={`menu-description-${index}`}
                      value={menu.description}
                      onChange={(e) => updateMenu(index, 'description', e.target.value)}
                      placeholder="김치찌개 + 밥 + 반찬 포함"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {/* 인기 메뉴 체크 */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`popular-${index}`}
                        checked={menu.is_popular}
                        onChange={(e) => updateMenu(index, 'is_popular', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`popular-${index}`} className="text-sm">
                        인기 메뉴로 설정
                      </Label>
                    </div>

                    {/* 이미지 업로드 */}
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`menu-image-${index}`} className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
                          <Camera className="h-4 w-4" />
                          <span className="text-sm">사진 추가</span>
                        </div>
                      </Label>
                      <input
                        type="file"
                        id={`menu-image-${index}`}
                        accept="image/*"
                        onChange={(e) => updateMenu(index, 'image', e.target.files?.[0])}
                        className="hidden"
                      />
                      {menu.image && (
                        <span className="text-xs text-green-600">
                          {menu.image.name}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 추가 정보 */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">💡 등록 팁</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 정확한 가격 정보를 입력해주세요 (최근 방문 기준)</li>
                <li>• 세트 메뉴의 경우 포함 사항을 설명에 적어주세요</li>
                <li>• 대표 메뉴는 "인기 메뉴"로 체크해주세요</li>
                <li>• 사진이 있으면 다른 사용자들에게 더 도움이 됩니다</li>
              </ul>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? '등록 중...' : '메뉴 등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 