/**
 * SSH Session Store (Zustand)
 * SSH 터미널 세션 전역 상태 관리
 *
 * 메모리 기반 상태 관리 (persist 없음):
 * - SPA 페이지 이동 시: 상태 유지
 * - 새로고침/브라우저 닫기: 상태 초기화
 *
 * 이유: 새로고침 시 WebSocket과 SSH 세션이 끊어지므로
 *       UI 상태도 함께 초기화되어야 실제 연결 상태와 일치
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface SshSession {
  sessionId: string
  host: string
  username: string
  userEmail: string
}

interface SshSessionState {
  // State
  session: SshSession | null
  isConnected: boolean
  terminalHistory: Record<string, string[]> // sessionId -> output history

  // Actions
  setSession: (session: SshSession | null) => void
  setConnected: (isConnected: boolean) => void
  appendOutput: (sessionId: string, output: string) => void
  clearHistory: (sessionId: string) => void
  disconnect: () => void
}

export const useSshSessionStore = create<SshSessionState>()(
  devtools(
    (set) => ({
      // Initial state
      session: null,
      isConnected: false,
      terminalHistory: {},

      // Actions
      setSession: (session: SshSession | null) =>
        set({ session }, false, 'setSession'),

      setConnected: (isConnected: boolean) =>
        set({ isConnected }, false, 'setConnected'),

      appendOutput: (sessionId: string, output: string) =>
        set(
          (state) => ({
            terminalHistory: {
              ...state.terminalHistory,
              [sessionId]: [...(state.terminalHistory[sessionId] || []), output],
            },
          }),
          false,
          'appendOutput'
        ),

      clearHistory: (sessionId: string) =>
        set(
          (state) => {
            const { [sessionId]: _, ...rest } = state.terminalHistory
            return { terminalHistory: rest }
          },
          false,
          'clearHistory'
        ),

      disconnect: () =>
        set({ session: null, isConnected: false }, false, 'disconnect'),
    }),
    { name: 'SshSessionStore' }
  )
)
