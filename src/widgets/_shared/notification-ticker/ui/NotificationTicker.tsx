/**
 * NotificationTicker — 탑바 아래 안읽은 메시지 티커
 *
 * 벨 배지만으로는 안읽은 메시지를 인지하지 못한다는 문제에서 출발했다.
 * 배지가 '작아서' 무시되는 것이므로, 시선이 반드시 지나가는 자리(헤더 직하 전폭)에
 * **읽기 전까지 사라지지 않는** 띠를 두어 상태를 계속 드러낸다.
 *
 * 왜 마퀴(좌→우 연속 스크롤)가 아닌가
 *  - 움직이는 글자는 클릭 표적이 함께 움직여 '열기'라는 목적 행동을 방해한다.
 *  - 상시 흐르는 요소는 며칠이면 광고로 분류되어 지금의 배지와 같은 운명이 된다.
 *  - WCAG 2.2.2 는 5초 이상 자동으로 움직이는 콘텐츠에 정지 수단을 요구한다.
 * 그래서 **글자는 멈춰 있고 4초마다 항목만 교체**한다. 변화가 주변시야를 잡되
 * 읽기와 클릭은 정지 상태에서 이뤄진다. hover/focus 시 교체를 멈춘다.
 *
 * 접근성 — aria-live 를 붙이지 않는다. 4초마다 스크린리더가 낭독하면 소음이 된다.
 * 도착 알림은 토스트(Radix Toast)가 이미 live 영역으로 처리하고, 여기서는 버튼의
 * aria-label 로 현재 항목을 노출한다.
 */

import { useEffect, useState } from 'react'

import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { MessageDetailDialog } from '@/features/messages/message-management'

import { useUnreadCount, useUnreadMessages } from '@/entities/messages/message'

import { ROUTES } from '@/shared/config/constants'
import { cn } from '@/shared/lib/utils'

/** 항목 교체 주기 — 읽고 반응할 여유를 주는 값 */
const ROTATE_INTERVAL_MS = 4000

/** 접힘/펼침 높이 (h-9 = 2.25rem) — 등장 시 레이아웃이 덜컥이지 않게 전환한다 */
const BAND_HEIGHT = 'h-9'

export function NotificationTicker() {
  const navigate = useNavigate()

  const { data: unread } = useUnreadCount()
  const { data: unreadInbox } = useUnreadMessages()

  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [detailMessageId, setDetailMessageId] = useState<number | null>(null)

  const messages = unreadInbox?.content ?? []
  const unreadCount = unread?.unreadCount ?? 0
  const isVisible = unreadCount > 0 && messages.length > 0

  // 메시지를 읽어 목록이 줄면 index 가 범위를 벗어난다 — 길이가 변하면 처음으로 되돌린다
  useEffect(() => {
    setIndex(0)
  }, [messages.length])

  useEffect(() => {
    if (isPaused || messages.length < 2) return

    // 모션 민감 사용자에게는 교체하지 않고 첫 항목만 보여준다
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % messages.length),
      ROTATE_INTERVAL_MS
    )
    return () => clearInterval(timer)
  }, [isPaused, messages.length])

  const current = messages[index]

  return (
    <>
      {/* 안읽음이 0 이 되면 높이만 0 으로 접는다 — DOM 은 남지만 화면에서는 사라진다 */}
      <div
        className={cn(
          'flex-none overflow-hidden transition-[height] duration-200',
          isVisible ? BAND_HEIGHT : 'h-0'
        )}
      >
        {isVisible && current && (
          <div
            role="region"
            aria-label="안읽은 메시지 알림"
            className={cn(
              BAND_HEIGHT,
              'flex items-center gap-2 border-b border-primary/30 border-l-[3px] border-l-primary',
              'bg-primary/10 pl-3 pr-2 text-sm'
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
              aria-hidden="true"
            />

            {/* 본문 — 현재 항목을 열면 그 자리에서 읽음 처리되어 티커가 줄어든다 */}
            <button
              type="button"
              // key 로 교체 시점마다 다시 마운트시켜 진입 애니메이션을 태운다
              key={current.messageId}
              onClick={() => setDetailMessageId(current.messageId)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              aria-label={`${
                current.messageType !== 'USER' ? '시스템' : current.senderName
              } · ${current.title} — 메시지 열기`}
              className="min-w-0 flex-1 truncate text-left duration-200
                         animate-in fade-in slide-in-from-bottom-2 hover:underline"
            >
              <span className="font-semibold">
                {current.messageType !== 'USER'
                  ? '시스템'
                  : `${current.senderName}님의 새 메시지`}
              </span>
              <span className="mx-1.5 text-muted-foreground">·</span>
              <span className="text-muted-foreground">{current.title}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.SUPPORT.SHARING.MESSAGES)}
              className="flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs
                         font-medium text-foreground hover:bg-primary/20"
            >
              안읽음 {unreadCount}건
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      <MessageDetailDialog
        messageId={detailMessageId}
        onClose={() => setDetailMessageId(null)}
      />
    </>
  )
}
