/**
 * SSH Shell Entity Types
 * Interactive SSH Shell 도메인 타입 정의
 */

/**
 * 셸 상태
 */
export type ShellStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'

/**
 * WebSocket 메시지 타입
 */
export type ShellMessageType = 'STATUS' | 'OUTPUT' | 'ERROR'

/**
 * 셸 연결 요청
 */
export interface ShellConnectRequest {
  host: string
  port: number
  username: string
  password: string
}

/**
 * 셸 연결 응답
 */
export interface ShellConnectResponse {
  shellSessionId: string
  status: ShellStatus
  host: string
  websocketUrl: string
  subscribeUrl: string
  commandUrl: string
  createdAt: string
  expiresAt: string
}

/**
 * 셸 세션 정보 응답
 */
export interface ShellSessionInfo {
  shellSessionId: string
  status: ShellStatus
  host: string
  username: string
  ownerEmail: string
  createdAt: string
  lastActivityAt: string
  expiresAt: string
  commandCount: number
}

/**
 * 명령어 메시지 (WebSocket - 클라이언트 → 서버)
 */
export interface CommandMessage {
  command: string
}

/**
 * 출력 메시지 (WebSocket - 서버 → 클라이언트)
 */
export interface OutputMessage {
  type: ShellMessageType
  status?: ShellStatus
  data?: string
  message?: string
  timestamp: string
}
