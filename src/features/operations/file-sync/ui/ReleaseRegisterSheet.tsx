/**
 * Release Register Sheet
 * 릴리즈 파일 등록 시트 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { FileArchive, Loader2 } from 'lucide-react'

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

import type { FileSyncResult, ReleaseRegisterItem } from '../api/types'

interface ReleaseRegisterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: ReleaseRegisterItem) => void
}

export function ReleaseRegisterSheet({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
}: ReleaseRegisterSheetProps) {
  const [releaseVersionId, setReleaseVersionId] = useState<number | null>(null)
  const [fileCategory, setFileCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [executionOrder, setExecutionOrder] = useState<number | null>(null)
  const [description, setDescription] = useState('')

  // 파일 카테고리 코드 조회 (DATABASE, WEB, ENGINE, ETC)
  const { data: categories = [] } = useCodesByType(CODE_TYPE.FILE_CATEGORY)

  const handleClose = () => {
    setReleaseVersionId(null)
    setFileCategory('')
    setSubCategory('')
    setExecutionOrder(null)
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    const data: ReleaseRegisterItem = {
      id: item.id,
      ...(releaseVersionId !== null && { releaseVersionId }),
      ...(fileCategory && { fileCategory }),
      ...(subCategory.trim() && { subCategory: subCategory.trim() }),
      ...(executionOrder !== null && { executionOrder }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            릴리즈 파일 등록
          </SheetTitle>
          <SheetDescription>
            파일을 릴리즈로 등록합니다. 추가 정보를 입력하세요.
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

            {/* 버전 ID */}
            <div className="space-y-2">
              <Label>버전 ID</Label>
              <Input
                type="number"
                value={releaseVersionId !== null ? releaseVersionId : ''}
                onChange={(e) =>
                  setReleaseVersionId(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="버전 ID (선택, 자동 추론 가능)"
              />
              <p className="text-xs text-muted-foreground">
                미입력 시 파일 경로에서 자동 추론됩니다.
              </p>
            </div>

            {/* 파일 카테고리 */}
            <div className="space-y-2">
              <Label>파일 카테고리</Label>
              <Combobox
                options={categories.map((cat: CodeSimpleResponse) => ({
                  value: cat.value,
                  label: cat.name,
                }))}
                value={fileCategory}
                onValueChange={setFileCategory}
                placeholder="카테고리 선택 (선택)"
                searchPlaceholder="카테고리 검색..."
              />
              <p className="text-xs text-muted-foreground">
                DATABASE, WEB, ENGINE, ETC 등 파일 분류
              </p>
            </div>

            {/* 서브 카테고리 */}
            <div className="space-y-2">
              <Label>서브 카테고리</Label>
              <Input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="서브 카테고리 (선택)"
              />
            </div>

            {/* 실행 순서 */}
            <div className="space-y-2">
              <Label>실행 순서</Label>
              <Input
                type="number"
                value={executionOrder !== null ? executionOrder : ''}
                onChange={(e) =>
                  setExecutionOrder(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="실행 순서 (선택, 기본값: 99)"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                데이터베이스 스크립트 실행 순서 (숫자가 작을수록 먼저 실행)
              </p>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="릴리즈 파일에 대한 설명 (선택)"
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
                    <FileArchive className="h-4 w-4 mr-2" />
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
