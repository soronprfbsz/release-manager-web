/**
 * Resource Register Sheet
 * 리소스 파일 등록 시트 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Loader2, Upload } from 'lucide-react'

import { useCodesByType, CODE_TYPE, type CodeSimpleResponse } from '@/entities/_shared/code'

import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

import type { FileSyncResult, ResourceRegisterItem } from '../api/types'

interface ResourceRegisterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: ResourceRegisterItem) => void
}

export function ResourceRegisterSheet({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
}: ResourceRegisterSheetProps) {
  const [resourceFileName, setResourceFileName] = useState('')
  const [fileCategory, setFileCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [description, setDescription] = useState('')

  // 카테고리 코드 조회
  const { data: categories = [] } = useCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY)

  // 서브카테고리 동적 조회 (SCRIPT -> RESOURCE_SUBCATEGORY_SCRIPT, DOCUMENT -> RESOURCE_SUBCATEGORY_DOCUMENT)
  const subCategoryCodeType = fileCategory === 'SCRIPT'
    ? CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
    : fileCategory === 'DOCUMENT'
      ? CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
      : null
  const { data: subCategories = [] } = useCodesByType(subCategoryCodeType as string)

  const handleCategoryChange = (value: string) => {
    setFileCategory(value)
    setSubCategory('') // 카테고리 변경 시 서브카테고리 초기화
  }

  const handleClose = () => {
    setResourceFileName('')
    setFileCategory('')
    setSubCategory('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    const data: ResourceRegisterItem = {
      id: item.id,
      ...(resourceFileName.trim() && { resourceFileName: resourceFileName.trim() }),
      ...(fileCategory && { fileCategory }),
      ...(subCategory && { subCategory }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            리소스 파일 등록
          </SheetTitle>
          <SheetDescription>
            파일을 리소스로 등록합니다. 추가 정보를 입력하세요.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 파일 정보 표시 */}
            {item && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">파일명: </span>
                  <span className="font-medium">{item.fileName}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  {item.filePath}
                </div>
              </div>
            )}

            {/* 대분류 */}
            <div className="space-y-2">
              <Label>대분류</Label>
              <Combobox
                options={categories.map((cat: CodeSimpleResponse) => ({
                  value: cat.value,
                  label: cat.name,
                }))}
                value={fileCategory}
                onValueChange={handleCategoryChange}
                placeholder="대분류를 선택하세요 (선택)"
                searchPlaceholder="대분류 검색..."
              />
            </div>

            {/* 소분류 */}
            {subCategories.length > 0 && (
              <div className="space-y-2">
                <Label>소분류</Label>
                <Combobox
                  options={subCategories.map((cat: CodeSimpleResponse) => ({
                    value: cat.value,
                    label: cat.name,
                  }))}
                  value={subCategory}
                  onValueChange={setSubCategory}
                  placeholder="소분류를 선택하세요 (선택)"
                  searchPlaceholder="소분류 검색..."
                />
              </div>
            )}

            {/* 리소스명 */}
            <div className="space-y-2">
              <Label>리소스명</Label>
              <Input
                value={resourceFileName}
                onChange={(e) => setResourceFileName(e.target.value)}
                placeholder="리소스 이름 (선택, 미입력시 파일명 사용)"
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="리소스에 대한 설명 (선택)"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    등록
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
