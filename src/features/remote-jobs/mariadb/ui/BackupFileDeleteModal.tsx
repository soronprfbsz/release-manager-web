/**
 * Backup File Delete Modal Component
 * 백업 파일 삭제 확인 모달
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

interface BackupFileDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  fileName: string
  onConfirm: () => void
  onClose: () => void
}

export function BackupFileDeleteModal({
  isOpen,
  isDeleting,
  fileName,
  onConfirm,
  onClose,
}: BackupFileDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>백업 파일 삭제 확인</DialogTitle>
          <DialogDescription>
            백업 파일 <strong className="text-foreground">{fileName}</strong>을(를)
            삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
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

