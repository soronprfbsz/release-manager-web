/**
 * Scheduler Delete Dialog Component
 * 스케줄러 삭제 확인 다이얼로그
 */

import { Loader2 } from 'lucide-react'

import type { ScheduleJob } from '@/entities/remote-jobs'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface SchedulerDeleteDialogProps {
  job: ScheduleJob | null
  isDeleting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function SchedulerDeleteDialog({
  job,
  isDeleting,
  onConfirm,
  onClose,
}: SchedulerDeleteDialogProps) {
  return (
    <Dialog open={job !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>스케줄 삭제</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{job?.jobName}</span>{' '}
            스케줄을 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
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
