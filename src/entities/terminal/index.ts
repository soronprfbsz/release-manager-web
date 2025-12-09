/**
 * Terminal Entity
 * 터미널 엔티티 - WebSocket 기반 원격 터미널
 */

// API
export { terminalApi } from './api/terminalApi'

// Types
export type {
  TerminalSession,
  TerminalSessionCreateRequest,
  TerminalSessionType,
  TerminalOutputMessage,
  TerminalInputMessage,
  TerminalConnectionStatus,
} from './model/types'

// Queries
export {
  terminalKeys,
  useTerminalSessions,
  useCreateTerminalSession,
  useDeleteTerminalSession,
} from './queries/terminalQueries'
