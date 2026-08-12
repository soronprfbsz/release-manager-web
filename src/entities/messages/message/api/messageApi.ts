/**
 * Message API
 * 사용자간 메시지 API
 */

import { apiClient } from '@/shared/api/client'
import type { PageResponse } from '@/shared/api/types'

import type {
  InboxMessage,
  InboxParams,
  MessageDetail,
  MessageSendRequest,
  OutboxMessage,
  OutboxParams,
  UnreadCount,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/messages',
  inbox: '/api/messages/inbox',
  outbox: '/api/messages/outbox',
  unreadCount: '/api/messages/unread-count',
  byId: (messageId: number) => `/api/messages/${messageId}`,
  read: (messageId: number) => `/api/messages/${messageId}/read`,
  inboxItem: (messageId: number) => `/api/messages/${messageId}/inbox`,
  outboxItem: (messageId: number) => `/api/messages/${messageId}/outbox`,
} as const

const buildQuery = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export const messageApi = {
  /** 메시지 발송 */
  send: async (request: MessageSendRequest): Promise<MessageDetail> => {
    const response = await apiClient.post<MessageDetail>(ENDPOINTS.base, request)
    return response
  },

  /** 수신함 조회 */
  getInbox: async (params?: InboxParams): Promise<PageResponse<InboxMessage>> => {
    const response = await apiClient.get<PageResponse<InboxMessage>>(
      `${ENDPOINTS.inbox}${buildQuery({ ...params })}`
    )
    return response
  },

  /** 발신함 조회 */
  getOutbox: async (params?: OutboxParams): Promise<PageResponse<OutboxMessage>> => {
    const response = await apiClient.get<PageResponse<OutboxMessage>>(
      `${ENDPOINTS.outbox}${buildQuery({ ...params })}`
    )
    return response
  },

  /** 메시지 상세 조회 */
  getDetail: async (messageId: number): Promise<MessageDetail> => {
    const response = await apiClient.get<MessageDetail>(ENDPOINTS.byId(messageId))
    return response
  },

  /** 읽음 처리 */
  markAsRead: async (messageId: number): Promise<void> => {
    await apiClient.patch(ENDPOINTS.read(messageId))
  },

  /** 수신함에서 삭제 (숨김) */
  deleteFromInbox: async (messageId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.inboxItem(messageId))
  },

  /** 발신함에서 삭제 (숨김) */
  deleteFromOutbox: async (messageId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.outboxItem(messageId))
  },

  /** 안읽은 메시지 개수 (탑바 배지) */
  getUnreadCount: async (): Promise<UnreadCount> => {
    const response = await apiClient.get<UnreadCount>(ENDPOINTS.unreadCount)
    return response
  },
}
