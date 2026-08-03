/**
 * Service Delete Dialog
 * 서비스/컴포넌트 삭제 확인 다이얼로그
 */

import { AlertTriangle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

import type { DeleteTarget } from '../model/types'

interface ServiceDeleteDialogProps {
  target: DeleteTarget | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
  componentCount?: number
}

export function ServiceDeleteDialog({
  target,
  isDeleting,
  onConfirm,
  onCancel,
  componentCount = 0,
}: ServiceDeleteDialogProps) {
  if (!target) return null

  const isService = target.type === 'service'

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {isService ? '서비스 삭제' : '컴포넌트 삭제'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-medium text-foreground">{target.name}</span>
                {isService ? '을(를) 삭제하시겠습니까?' : '을(를) 삭제하시겠습니까?'}
              </p>

              {isService && componentCount > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ 전체 삭제 경고
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    이 서비스에 연결된 <span className="font-medium text-foreground">{componentCount}개의 컴포넌트</span>도 함께 삭제됩니다.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/70"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
