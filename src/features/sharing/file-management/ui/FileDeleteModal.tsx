/**
 * File Delete Modal Component
 * 파일 삭제 확인 모달
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

interface FileDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  fileName: string
  onConfirm: () => void
  onClose: () => void
}

export function FileDeleteModal({
  isOpen,
  isDeleting,
  fileName,
  onConfirm,
  onClose,
}: FileDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>파일 삭제</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{fileName}</span> 파일을
            삭제하시겠습니까?
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

