/**
 * Message Delete Dialog Component
 * 메시지 삭제 확인 다이얼로그 컴포넌트
 *
 * 삭제는 각자의 목록에서만 숨기는 처리라, 상대방 쪽에는 그대로 남는다는 점을
 * 문구로 분명히 알린다.
 */

import { AlertTriangle } from 'lucide-react'

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

/** 어느 목록에서 지우는지 — 안내 문구가 달라진다 */
export type MessageDeleteTarget = 'inbox' | 'outbox'

interface MessageDeleteDialogProps {
  open: boolean
  target: MessageDeleteTarget
  messageTitle: string | null
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const TARGET_TEXT = {
  inbox: {
    title: '수신함에서 삭제',
    notice: '내 수신함에서만 사라지며, 보낸 사람의 발신함에는 그대로 남습니다.',
  },
  outbox: {
    title: '발신함에서 삭제',
    notice: '내 발신함에서만 사라지며, 받는 사람의 수신함에는 그대로 남습니다.',
  },
} as const

export function MessageDeleteDialog({
  open,
  target,
  messageTitle,
  isDeleting = false,
  onConfirm,
  onCancel,
}: MessageDeleteDialogProps) {
  const { title, notice } = TARGET_TEXT[target]

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            정말 <strong>{messageTitle}</strong> 메시지를 삭제하시겠습니까?
            <br />
            <br />
            {notice}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-8 px-3 text-xs" onClick={onCancel}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-8 bg-destructive px-3 text-xs text-destructive-foreground hover:bg-destructive/70"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
