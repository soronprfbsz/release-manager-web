/**
 * Message Queries
 * 메시지 React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { messageApi } from '../api/messageApi'

import type {
  InboxParams,
  MessageSendRequest,
  OutboxParams,
} from '../model/types'

/**
 * 안읽은 개수 백업 폴링 주기 (ms)
 *
 * 실시간 전달은 2단계에서 붙일 WebSocket 이 담당하고, 이 폴링은 연결이 조용히
 * 끊겼을 때를 대비한 그물망이다 (ADR-0004). 폴링 요청은 전부 api_log 에
 * 적재되므로 주기를 짧게 두지 않는다.
 */
const UNREAD_COUNT_POLL_INTERVAL = 5 * 60 * 1000

// Query Keys Factory
export const messageKeys = {
  all: ['messages'] as const,
  // prefix 키 — 파라미터가 붙은 하위 키까지 한 번에 무효화하는 데 쓴다
  inboxes: () => [...messageKeys.all, 'inbox'] as const,
  outboxes: () => [...messageKeys.all, 'outbox'] as const,
  inbox: (params?: InboxParams) => [...messageKeys.inboxes(), params ?? {}] as const,
  outbox: (params?: OutboxParams) => [...messageKeys.outboxes(), params ?? {}] as const,
  detail: (messageId: number) => [...messageKeys.all, 'detail', messageId] as const,
  unreadCount: () => [...messageKeys.all, 'unread-count'] as const,
}

// Query Hooks

/**
 * 수신함 조회
 *
 * @param options.enabled 벨 드롭다운처럼 열렸을 때만 조회해야 하는 곳에서 사용
 */
export const useInbox = (params?: InboxParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: messageKeys.inbox(params),
    queryFn: () => messageApi.getInbox(params),
    enabled: options?.enabled ?? true,
  })

/** 발신함 조회 */
export const useOutbox = (params?: OutboxParams) =>
  useQuery({
    queryKey: messageKeys.outbox(params),
    queryFn: () => messageApi.getOutbox(params),
  })

/** 메시지 상세 조회 */
export const useMessageDetail = (messageId: number | null) =>
  useQuery({
    queryKey: messageKeys.detail(messageId ?? 0),
    queryFn: () => messageApi.getDetail(messageId!),
    enabled: !!messageId,
  })

/**
 * 안읽은 메시지 개수 (탑바 배지)
 *
 * 로그인 직후 자동으로 한 번 조회되므로 별도의 "신규 로그인 체크"는 필요 없다.
 */
export const useUnreadCount = () =>
  useQuery({
    queryKey: messageKeys.unreadCount(),
    queryFn: () => messageApi.getUnreadCount(),
    refetchInterval: UNREAD_COUNT_POLL_INTERVAL,
    refetchOnWindowFocus: true,
  })

// Mutation Hooks

/** 메시지 발송 */
export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MessageSendRequest) => messageApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all })
    },
  })
}

/** 읽음 처리 — 배지와 목록을 함께 갱신 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => messageApi.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all })
    },
  })
}

/** 수신함에서 삭제 (숨김) */
export const useDeleteFromInbox = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => messageApi.deleteFromInbox(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all })
    },
  })
}

/** 발신함에서 삭제 (숨김) */
export const useDeleteFromOutbox = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => messageApi.deleteFromOutbox(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.outboxes() })
    },
  })
}
