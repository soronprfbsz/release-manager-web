/**
 * Post Delete Dialog Component
 * 게시글 삭제 확인 다이얼로그
 */

import { Loader2 } from 'lucide-react'

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

interface PostDeleteDialogProps {
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function PostDeleteDialog({
  isOpen,
  isDeleting,
  onConfirm,
  onClose,
}: PostDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            정말로 이 게시글을 삭제하시겠습니까?
            게시글과 관련된 모든 댓글이 함께 삭제되며, 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
