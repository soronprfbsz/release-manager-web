/**
 * Message Entity Public API
 * 사용자간 메시지 / 시스템 알림 엔티티
 */

// Types
export type {
  MessageType,
  MessageSendRequest,
  MessageRecipientInfo,
  InboxMessage,
  OutboxMessage,
  MessageDetail,
  UnreadCount,
  InboxParams,
  OutboxParams,
} from './model/types'

// API
export { messageApi } from './api/messageApi'
export { messageSocket } from './api/messageSocket'
export type { NewMessageEvent } from './api/messageSocket'

// Queries
export {
  messageKeys,
  useInbox,
  useOutbox,
  useMessageDetail,
  useUnreadCount,
  useSendMessage,
  useMarkMessageAsRead,
  useDeleteFromInbox,
  useDeleteFromOutbox,
} from './queries/messageQueries'
