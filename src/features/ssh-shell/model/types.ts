/**
 * SSH Shell Feature Types
 * SSH Shell 기능 타입 정의
 */

/**
 * SSH 연결 폼 데이터
 */
export interface SshConnectionFormData {
  host: string
  port: number
  username: string
  password: string
}

/**
 * 터미널 출력 라인 데이터
 */
export interface TerminalLine {
  id: string
  type: 'output' | 'error' | 'status' | 'command'
  content: string
  timestamp: string
}

/**
 * SSH Shell 상태
 */
export interface SshShellState {
  shellSessionId: string | null
  status: string | null
  isConnected: boolean
  lines: TerminalLine[]
  host: string | null
  username: string | null
  commandHistory: string[]
  historyIndex: number
}

/**
 * 폼 데이터 초기값
 */
export const INITIAL_FORM_DATA: SshConnectionFormData = {
  host: '',
  port: 22,
  username: '',
  password: '',
}

/**
 * SSH Shell 상태 초기값
 */
export const INITIAL_SHELL_STATE: SshShellState = {
  shellSessionId: null,
  status: null,
  isConnected: false,
  lines: [],
  host: null,
  username: null,
  commandHistory: [],
  historyIndex: -1,
}
