/**
 * SSH Shell API
 * Interactive SSH Shell API 함수
 */

import { apiClient } from '@/shared/api'
import { API_TIMEOUT } from '@/shared/config/constants'

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

  /**
   * 파일 업로드 (원격 호스트로 전송)
   * POST /api/terminal/{id}/files
   */
  uploadFile: async (
    sessionId: string,
    file: File,
    remotePath?: string,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    if (remotePath) {
      formData.append('remotePath', remotePath)
    }

    await apiClient.upload(`${BASE_URL}/${sessionId}/files`, formData, {
      onUploadProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
    })
  },

  /**
   * 패치 파일 배포
   * POST /api/terminal/{id}/patches
   */
  deployPatch: async (sessionId: string, patchId: number, remotePath?: string): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${sessionId}/patches`, {
      patchId,
      remotePath,
    })
  },
}
