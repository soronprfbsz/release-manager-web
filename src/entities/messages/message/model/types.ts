/**
 * Message 도메인 타입
 *
 * 백엔드 MessageDto 와 1:1 대응.
 * 시스템 알림(PATCH_REMINDER)도 발신자만 시스템 계정일 뿐 같은 구조다.
 */

/** 메시지 유형 */
export type MessageType =
  | 'USER'
  | 'PATCH_REMINDER'
  | 'PASSWORD_RESET_REQUEST'
  | 'SIGNUP_APPROVAL_REQUEST'
  | 'ACCOUNT_UPDATED'
  | 'PASSWORD_RESET_DONE'

/** 메시지 발송 요청 */
export interface MessageSendRequest {
  recipientIds: number[]
  title: string
  content: string
}

/** 수신자 정보 (발신함 / 상세) */
export interface MessageRecipientInfo {
  accountId: number | null
  accountName: string
  email: string
  departmentName: string | null
  readAt: string | null
}

/** 수신함 항목 */
export interface InboxMessage {
  messageId: number
  messageType: MessageType
  title: string
  content: string
  senderAccountId: number | null
  senderName: string
  senderEmail: string
  senderAvatarStyle: string | null
  senderAvatarSeed: string | null
  isDeletedSender: boolean
  refType: string | null
  refId: number | null
  refProjectId: string | null
  refReleaseType: string | null
  readAt: string | null
  createdAt: string
}

/** 발신함 항목 */
export interface OutboxMessage {
  messageId: number
  messageType: MessageType
  title: string
  content: string
  recipients: MessageRecipientInfo[]
  recipientCount: number
  readCount: number
  createdAt: string
}

/** 메시지 상세 */
export interface MessageDetail {
  messageId: number
  messageType: MessageType
  title: string
  content: string
  senderAccountId: number | null
  senderName: string
  senderEmail: string
  senderAvatarStyle: string | null
  senderAvatarSeed: string | null
  isDeletedSender: boolean
  recipients: MessageRecipientInfo[]
  refType: string | null
  refId: number | null
  refProjectId: string | null
  refReleaseType: string | null
  myReadAt: string | null
  createdAt: string
}

/** 안읽은 메시지 개수 (탑바 배지) */
export interface UnreadCount {
  unreadCount: number
}

/** 수신함 조회 파라미터 */
export interface InboxParams {
  page?: number
  size?: number
  unreadOnly?: boolean
  keyword?: string
}

/** 발신함 조회 파라미터 */
export interface OutboxParams {
  page?: number
  size?: number
  keyword?: string
}
