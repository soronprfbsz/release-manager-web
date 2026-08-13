/**
 * NotificationProvider
 * 로그인 상태에서 알림 소켓을 유지하고, 신규 메시지 도착 시 토스트를 띄운다.
 *
 * MainLayout 안에 두는 이유 — 인증된 화면에서만 필요하고, 상세 모달이
 * react-router 컨텍스트(useNavigate)를 사용하기 때문이다.
 */

import { useEffect, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { MessageDetailDialog } from '@/features/messages/message-management'

import { messageKeys, messageSocket } from '@/entities/messages/message'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { useAuthStore } from '@/shared/store'
import { ToastAction } from '@/shared/ui/toast'

export function NotificationProvider() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [detailMessageId, setDetailMessageId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      messageSocket.disconnect()
      return
    }

    messageSocket.connect()

    const offMessage = messageSocket.onMessage((event) => {
      // 배지와 목록을 함께 갱신 — 서버가 준 payload 는 토스트 표시용 최소 정보다
      queryClient.invalidateQueries({ queryKey: messageKeys.all })

      toast({
        title:
          event.messageType !== 'USER'
            ? '새 시스템 알림'
            : `${event.senderName}님의 새 메시지`,
        description: event.title,
        action: (
          <ToastAction
            altText="메시지 보기"
            onClick={() => setDetailMessageId(event.messageId)}
          >
            보기
          </ToastAction>
        ),
      })
    })

    // 재연결 시점 — 끊겨 있는 동안 놓친 메시지가 있을 수 있어 배지를 다시 맞춘다
    const offConnect = messageSocket.onConnect(() => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unreadCount() })
    })

    return () => {
      offMessage()
      offConnect()
    }
  }, [user, queryClient, toast])

  // 로그아웃 등으로 언마운트될 때 연결 정리
  useEffect(() => {
    return () => messageSocket.disconnect()
  }, [])

  return (
    <MessageDetailDialog
      messageId={detailMessageId}
      onClose={() => setDetailMessageId(null)}
    />
  )
}
