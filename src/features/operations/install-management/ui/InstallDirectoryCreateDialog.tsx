/**
 * Install Directory Create Dialog
 * 인스톨 디렉토리 생성 다이얼로그 컴포넌트
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

interface InstallDirectoryCreateDialogProps {
  isOpen: boolean
  parentPath: string
  isCreating: boolean
  onConfirm: (directoryName: string) => void
  onCancel: () => void
}

export function InstallDirectoryCreateDialog({
  isOpen,
  parentPath,
  isCreating,
  onConfirm,
  onCancel,
}: InstallDirectoryCreateDialogProps) {
  const [directoryName, setDirectoryName] = useState('')
  const [error, setError] = useState('')

  // 다이얼로그가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setDirectoryName('')
      setError('')
    }
  }, [isOpen])

  const handleConfirm = () => {
    const trimmedName = directoryName.trim()

    if (!trimmedName) {
      setError('폴더명을 입력해주세요.')
      return
    }

    // 유효하지 않은 문자 체크 (슬래시는 중첩 경로 생성을 위해 허용)
    if (/[<>:"\\|?*]/.test(trimmedName)) {
      setError('폴더명에 사용할 수 없는 문자가 포함되어 있습니다.')
      return
    }

    setError('')
    onConfirm(trimmedName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      e.preventDefault()
      handleConfirm()
    }
  }

  // 전체 경로 미리보기
  const fullPath = parentPath === '/'
    ? `/${directoryName || '새폴더'}`
    : `${parentPath}/${directoryName || '새폴더'}`

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <DOMAIN_ICONS.install className="h-5 w-5" />
            폴더 생성
          </AlertDialogTitle>
          <AlertDialogDescription>
            새로운 폴더를 생성합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* 부모 경로 표시 */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">위치</Label>
            <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
              {parentPath}
            </p>
          </div>

          {/* 폴더명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="directoryName">폴더명</Label>
            <Input
              id="directoryName"
              value={directoryName}
              onChange={(e) => {
                setDirectoryName(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder="새폴더 또는 경로/하위폴더"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              중첩 폴더 생성 가능 (예: test/2024/01)
            </p>
          </div>

          {/* 전체 경로 미리보기 */}
          {directoryName.trim() && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">생성될 경로</Label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded text-primary">
                {fullPath}
              </p>
            </div>
          )}
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
            disabled={isCreating || !directoryName.trim()}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            {isCreating ? '생성 중...' : '생성'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
