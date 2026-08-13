/**
 * MessageDetailDialog
 * 메시지 상세 모달 — 벨 드롭다운과 메시지함이 함께 쓴다
 *
 * 열리는 순간 읽음 처리되어 탑바 배지가 즉시 줄어든다.
 * 패치 독촉이면 해당 패치가 속한 프로젝트로 전환한 뒤 패치 관리로 보낸다 —
 * 패치 목록은 전역 projectId 로 걸러지므로 프로젝트 전환 없이 이동하면
 * 정작 그 패치가 목록에 보이지 않는다 (ADR-0005).
 */

import { useEffect } from 'react'

import { ExternalLink, Mail, MailOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useMarkMessageAsRead, useMessageDetail } from '@/entities/messages/message'

import { ROUTES } from '@/shared/config/constants'
import { formatDateTime } from '@/shared/lib/utils/date'
import { useProjectStore } from '@/shared/store'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'

interface MessageDetailDialogProps {
  messageId: number | null
  onClose: () => void
  /** 수신함에서 열었을 때만 읽음 처리 (발신함에서 열면 처리하지 않음) */
  markReadOnOpen?: boolean
}

export function MessageDetailDialog({
  messageId,
  onClose,
  markReadOnOpen = true,
}: MessageDetailDialogProps) {
  const navigate = useNavigate()
  const selectProject = useProjectStore((state) => state.selectProject)

  const { data: message, isLoading } = useMessageDetail(messageId)
  const markAsRead = useMarkMessageAsRead()

  /**
   * 읽음 처리는 "아직 안읽은 내 메시지"일 때만 한 번 실행한다.
   * mutate 를 의존성에 넣으면 매 렌더마다 재실행되므로 messageId 기준으로만 건다.
   */
  useEffect(() => {
    if (!markReadOnOpen || !messageId || !message) return
    if (message.myReadAt !== null) return

    markAsRead.mutate(messageId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId, message?.myReadAt, markReadOnOpen])

  const handleOpenPatch = () => {
    if (!message?.refProjectId) return

    selectProject(message.refProjectId)
    const tab = message.refReleaseType === 'CUSTOM' ? 'custom' : 'standard'
    navigate(`${ROUTES.PATCHES}?tab=${tab}`)
    onClose()
  }

  const isPatchReminder = message?.messageType === 'PATCH_REMINDER'
  const isAccountRequest =
    message?.messageType === 'PASSWORD_RESET_REQUEST' ||
    message?.messageType === 'SIGNUP_APPROVAL_REQUEST'
  const isSystemMessage = isPatchReminder || isAccountRequest

  const handleOpenAccounts = () => {
    navigate(ROUTES.OPERATIONS.ACCOUNTS)
    onClose()
  }

  return (
    <Dialog open={!!messageId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {isLoading || !message ? (
          <div className="py-10 text-center text-muted-foreground">불러오는 중…</div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-2">
                {isSystemMessage ? (
                  <Badge variant="secondary" className="mt-0.5 shrink-0">
                    시스템
                  </Badge>
                ) : null}
                <DialogTitle className="text-left">{message.title}</DialogTitle>
              </div>
              <DialogDescription className="text-left">
                {message.senderName}
                {message.isDeletedSender ? ' (탈퇴)' : ''} · {formatDateTime(message.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[50vh]">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            </ScrollArea>

            {message.recipients.length > 0 && (
              <div className="space-y-1.5 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  수신자 {message.recipients.length}명
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {message.recipients.map((recipient) => (
                    <Badge
                      key={`${recipient.accountId ?? recipient.email}`}
                      variant="outline"
                      className="gap-1 font-normal"
                    >
                      {recipient.readAt ? (
                        <MailOpen className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {recipient.accountName}
                      {recipient.departmentName ? ` · ${recipient.departmentName}` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              {isPatchReminder && message.refProjectId && (
                <Button variant="outline" size="sm" onClick={handleOpenPatch}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  패치 관리 열기
                </Button>
              )}
              {isAccountRequest && (
                <Button variant="outline" size="sm" onClick={handleOpenAccounts}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  계정 관리 열기
                </Button>
              )}
              <Button size="sm" onClick={onClose}>닫기</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
