/**
 * Resource Category Delete Dialog
 * 리소스 카테고리 삭제 확인 다이얼로그 컴포넌트
 */

import { Trash2 } from 'lucide-react'

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

export interface ResourceCategoryDeleteTarget {
  category: string
  fileCount: number
}

interface ResourceCategoryDeleteDialogProps {
  target: ResourceCategoryDeleteTarget | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ResourceCategoryDeleteDialog({
  target,
  isDeleting,
  onConfirm,
  onCancel,
}: ResourceCategoryDeleteDialogProps) {
  if (!target) return null

  const hasFiles = target.fileCount > 0

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <DOMAIN_ICONS.file className="h-5 w-5" />
            카테고리 삭제
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                <strong>{target.category}</strong> 카테고리를 삭제하시겠습니까?
              </p>
              {hasFiles ? (
                <p className="text-destructive">
                  이 카테고리에는 {target.fileCount}개의 파일이 있습니다.
                  파일이 있는 카테고리는 삭제할 수 없습니다.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  빈 카테고리입니다. 삭제하면 복구할 수 없습니다.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting || hasFiles}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
