/**
 * NotificationBell — 탑바 알림 벨
 *
 * 배지는 안읽은 메시지 수. 0 이면 숫자를 표시하지 않고, 99 를 넘으면 99+ 로 줄인다.
 * 드롭다운 항목을 클릭하면 상세 모달이 열리고 그 순간 읽음 처리되어 배지가 줄어든다.
 */

import { useState } from 'react'

import { Bell, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { MessageDetailDialog } from '@/features/messages/message-management'

import { useInbox, useUnreadCount } from '@/entities/messages/message'


import { ROUTES } from '@/shared/config/constants'
import { getRelativeTime } from '@/shared/lib/utils/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

/** 드롭다운에 표시할 최근 메시지 수 */
const PREVIEW_SIZE = 10

export function NotificationBell() {
  const navigate = useNavigate()
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const { data: unread } = useUnreadCount()
  // 드롭다운이 열려 있을 때만 목록을 받아온다 — 배지는 별도 경량 쿼리로 갱신된다
  const { data: inbox, isLoading } = useInbox(
    { page: 0, size: PREVIEW_SIZE },
    { enabled: isOpen }
  )

  const unreadCount = unread?.unreadCount ?? 0
  const messages = inbox?.content ?? []

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost-icon"
            size="icon-sm"
            className="relative"
            title="알림"
          >
            <Bell className="h-[1.1rem] w-[1.1rem]" />
            {unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center
                           rounded-full bg-destructive px-1 text-[0.625rem] font-semibold
                           leading-none text-destructive-foreground"
                aria-label={`안읽은 메시지 ${unreadCount}건`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <span className="sr-only">알림</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>알림</span>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}건 안읽음</Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              불러오는 중…
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              받은 메시지가 없습니다.
            </div>
          )}

          {messages.map((message) => (
            <DropdownMenuItem
              key={message.messageId}
              className="flex flex-col items-start gap-0.5 py-2"
              onSelect={() => setSelectedMessageId(message.messageId)}
            >
              <div className="flex w-full items-center gap-1.5">
                {message.readAt === null ? (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
                    aria-label="안읽음"
                  />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0" />
                )}
                <span
                  className={`flex-1 truncate text-sm ${
                    message.readAt === null ? 'font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {message.title}
                </span>
                <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                  {getRelativeTime(message.createdAt)}
                </span>
              </div>
              <span className="pl-3 text-xs text-muted-foreground">
                {message.messageType === 'PATCH_REMINDER' ? '시스템' : message.senderName}
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => navigate(ROUTES.SUPPORT.SHARING.MESSAGES)}
            className="justify-center text-sm"
          >
            <Mail className="mr-2 h-4 w-4" />
            전체 보기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MessageDetailDialog
        messageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />
    </>
  )
}
