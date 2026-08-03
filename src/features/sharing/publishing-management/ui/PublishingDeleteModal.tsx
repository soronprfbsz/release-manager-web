/**
 * Publishing Delete Modal Component
 * 퍼블리싱 삭제 확인 모달
 */

import { AlertTriangle, Loader2 } from 'lucide-react'

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

interface PublishingDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  publishingName: string
  onConfirm: () => void
  onClose: () => void
}

export function PublishingDeleteModal({
  isOpen,
  isDeleting,
  publishingName,
  onConfirm,
  onClose,
}: PublishingDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            퍼블리싱 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{publishingName}</span>
            {' '}퍼블리싱을 삭제하시겠습니까?
            <br />
            <span className="text-destructive">이 작업은 되돌릴 수 없습니다.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/70"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

