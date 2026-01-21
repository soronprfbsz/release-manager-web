/**
 * Install File Delete Dialog
 * 인스톨 파일 삭제 확인 다이얼로그
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

import type { InstallFileDeleteTarget } from '../model/types'

interface InstallFileDeleteDialogProps {
  target: InstallFileDeleteTarget | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function InstallFileDeleteDialog({
  target,
  isDeleting,
  onConfirm,
  onCancel,
}: InstallFileDeleteDialogProps) {
  if (!target) return null

  const isDirectory = target.type === 'directory'

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {isDirectory ? '폴더 삭제' : '파일 삭제'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-medium text-foreground">{target.name}</span>
                을(를) 삭제하시겠습니까?
              </p>

              {isDirectory && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive font-medium">
                    폴더 삭제 경고
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    폴더 내의 모든 파일과 하위 폴더가 함께 삭제됩니다.
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
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
