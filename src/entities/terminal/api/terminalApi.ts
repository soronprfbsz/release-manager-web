/**
 * Terminal API Client
 * 터미널 세션 관리 API (SHELL 타입)
 */

import { apiClient } from '@/shared/api'
import type { TerminalSession } from '../model/types'

const BASE_URL = '/api/terminal/shell'

export const terminalApi = {
  /**
   * 새 셸 터미널 세션 생성
   */
  createSession: async (): Promise<TerminalSession> => {
    const response = await apiClient.post<TerminalSession>(BASE_URL, {})
    return response
  },

  /**
   * 셸 터미널 세션 종료
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${sessionId}`)
  },

  /**
   * 활성 셸 세션 목록 조회
   */
  listSessions: async (): Promise<TerminalSession[]> => {
    const response = await apiClient.get<TerminalSession[]>(`${BASE_URL}s`)
    return response
  },
}
