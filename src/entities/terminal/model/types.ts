/**
 * Terminal Entity Types
 * 터미널 관련 타입 정의
 */

/**
 * 터미널 세션 타입
 */
export type TerminalSessionType = 'SCRIPT' | 'SHELL'

/**
 * 터미널 세션 생성 요청 (SHELL 타입 - 빈 객체)
 */
export interface TerminalSessionCreateRequest {
  // SHELL 타입은 빈 객체
}

/**
 * 터미널 세션 정보
 */
export interface TerminalSession {
  sessionId: string
  type: TerminalSessionType
  websocketUrl: string
  subscribeUrl: string
  publishUrl: string
  expiresAt: string
}

/**
 * WebSocket 출력 메시지 (서버 → 클라이언트)
 */
export interface TerminalOutputMessage {
  type: 'output' | 'error' | 'exit'
  data: string // ANSI escape 코드 포함 가능
  timestamp: string // ISO 8601
  exitCode?: number // type="exit"일 때만
}

/**
 * WebSocket 입력 메시지 (클라이언트 → 서버)
 */
export interface TerminalInputMessage {
  type: 'input' | 'signal'
  data: string // type="input": 사용자 입력, type="signal": SIGINT/SIGTERM/SIGKILL
  timestamp: string // ISO 8601
}

/**
 * 터미널 연결 상태
 */
export type TerminalConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
