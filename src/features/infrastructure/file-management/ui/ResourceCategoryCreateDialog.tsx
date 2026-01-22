/**
 * Resource Category Create Dialog
 * 리소스 카테고리 생성 다이얼로그 컴포넌트
 */

import { useState, useEffect } from 'react'

import { FolderPlus } from 'lucide-react'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface ResourceCategoryCreateDialogProps {
  isOpen: boolean
  isCreating: boolean
  onConfirm: (category: string) => void
  onCancel: () => void
}

// 카테고리명 유효성 검사 정규식: 영문 소문자, 숫자, 하이픈, 언더스코어만 허용
const CATEGORY_PATTERN = /^[a-z0-9_-]+$/

export function ResourceCategoryCreateDialog({
  isOpen,
  isCreating,
  onConfirm,
  onCancel,
}: ResourceCategoryCreateDialogProps) {
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState('')

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setCategoryName('')
      setError('')
    }
  }, [isOpen])

  const handleConfirm = () => {
    // 소문자 변환
    const normalizedName = categoryName.trim().toLowerCase()

    if (!normalizedName) {
      setError('카테고리명을 입력해주세요.')
      return
    }

    // 유효성 검사
    if (!CATEGORY_PATTERN.test(normalizedName)) {
      setError('영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용할 수 있습니다.')
      return
    }

    setError('')
    onConfirm(normalizedName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault()
      handleConfirm()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력 시 소문자 변환
    setCategoryName(e.target.value.toLowerCase())
    setError('')
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <DOMAIN_ICONS.file className="h-5 w-5" />
            카테고리 생성
          </AlertDialogTitle>
          <AlertDialogDescription>
            새로운 파일 카테고리를 생성합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* 카테고리명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="categoryName">카테고리명</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="예: backup, install-guide"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              영문 소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCreating || !categoryName.trim()}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            {isCreating ? '생성 중...' : '생성'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
