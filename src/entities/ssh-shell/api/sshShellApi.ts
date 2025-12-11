/**
 * SSH Shell API
 * Interactive SSH Shell API 함수
 */

import { apiClient } from '@/shared/api'

import type { ShellConnectRequest, ShellConnectResponse, ShellSessionInfo } from '../model/types'

const BASE_URL = '/api/terminal'

/**
 * SSH Shell API
 */
export const sshShellApi = {
  /**
   * 셸 연결
   */
  connect: async (request: ShellConnectRequest): Promise<ShellConnectResponse> => {
    const response = await apiClient.post<ShellConnectResponse>(BASE_URL, request)
    return response
  },

  /**
   * 세션 정보 조회
   */
  getSessionInfo: async (sessionId: string): Promise<ShellSessionInfo> => {
    const response = await apiClient.get<ShellSessionInfo>(`${BASE_URL}/${sessionId}`)
    return response
  },

  /**
   * 셸 연결 종료
   */
  disconnect: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${sessionId}`)
  },
}
