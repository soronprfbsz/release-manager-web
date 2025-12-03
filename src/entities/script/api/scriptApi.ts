import { apiClient } from '@/shared/api/client'
import type { ScriptType } from '../model/types'

const ENDPOINTS = {
  types: '/api/scripts/types',
  download: '/api/scripts/download',
} as const

export const scriptApi = {
  /** 스크립트 타입 목록 조회 */
  getTypes: async (): Promise<ScriptType[]> => {
    const response = await apiClient.get<ScriptType[]>(ENDPOINTS.types)
    return response
  },

  /** 스크립트 다운로드 */
  download: async (code: string): Promise<void> => {
    // 브라우저 네이티브 다운로드 사용 (진행률 자동 표시)
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL || ''}${ENDPOINTS.download}?type=${encodeURIComponent(code)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
