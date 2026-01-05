/**
 * Patch Delete Modal Component
 * 패치 삭제 확인 모달
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

interface PatchDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  patchName: string
  onConfirm: () => void
  onClose: () => void
}

export function PatchDeleteModal({
  isOpen,
  isDeleting,
  patchName,
  onConfirm,
  onClose,
}: PatchDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>패치 삭제 확인</DialogTitle>
          <DialogDescription>
            패치 <strong className="text-foreground">{patchName}</strong>을(를) 삭제하시겠습니까?
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

