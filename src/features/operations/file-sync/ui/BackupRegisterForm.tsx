/**
 * Backup Register Form
 * 백업 파일 등록 폼 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Database, Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
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

import type { FileSyncResult, BackupRegisterItem } from '../api/types'

interface BackupRegisterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: BackupRegisterItem) => void
}

export function BackupRegisterForm({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
}: BackupRegisterFormProps) {
  const [fileCategory, setFileCategory] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setFileCategory('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    const data: BackupRegisterItem = {
      id: item.id,
      ...(fileCategory.trim() && { fileCategory: fileCategory.trim() }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            백업 파일 등록
          </SheetTitle>
          <SheetDescription>
            파일을 백업으로 등록합니다. 추가 정보를 입력하세요.
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

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Input
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value)}
                placeholder="카테고리 (선택, 예: MARIADB)"
              />
              <p className="text-xs text-muted-foreground">
                미입력 시 파일 경로에서 자동 추론됩니다.
              </p>
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="백업 파일에 대한 설명 (선택)"
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
                    <Database className="h-4 w-4 mr-2" />
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

