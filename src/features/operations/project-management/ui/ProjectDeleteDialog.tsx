/**
 * Project Delete Dialog Component
 * 프로젝트 삭제 확인 다이얼로그
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

interface ProjectDeleteDialogProps {
  isOpen: boolean
  projectName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ProjectDeleteDialog({
  isOpen,
  projectName,
  isDeleting,
  onConfirm,
  onCancel,
}: ProjectDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 <strong>'{projectName}'</strong> 프로젝트를 삭제하시겠습니까?
            <br />
            <span className="text-destructive">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
