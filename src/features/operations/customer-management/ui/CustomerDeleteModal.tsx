/**
 * Customer Delete Modal Component
 * 고객사 삭제 확인 모달
 */

import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/ui/dialog'

interface CustomerDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CustomerDeleteModal({
  isOpen,
  isDeleting,
  onConfirm,
  onClose,
}: CustomerDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>고객사 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 고객사를 삭제하시겠습니까?
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

