/**
 * Patch Bulk Delete Modal Component
 * 패치 일괄 삭제 확인 모달
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

interface PatchBulkDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  count: number
  onConfirm: () => void
  onClose: () => void
}

export function PatchBulkDeleteModal({
  isOpen,
  isDeleting,
  count,
  onConfirm,
  onClose,
}: PatchBulkDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>패치 일괄 삭제 확인</DialogTitle>
          <DialogDescription>
            선택된 <strong className="text-foreground">{count}개</strong>의 패치를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없으며, 모든 관련 파일이 삭제됩니다.
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
