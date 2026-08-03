/**
 * Site Note Delete Dialog Component
 * 사이트 특이사항 삭제 확인 다이얼로그
 */

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

interface SiteNoteDeleteDialogProps {
  open: boolean
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function SiteNoteDeleteDialog({
  open,
  isDeleting,
  onConfirm,
  onCancel,
}: SiteNoteDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>특이사항 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            이 특이사항을 삭제하시겠습니까? 삭제된 내용은 복구할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
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
