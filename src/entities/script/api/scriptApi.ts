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
  download: async (code: string, defaultFileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(
      `${ENDPOINTS.download}?type=${encodeURIComponent(code)}`,
      { responseType: 'blob' }
    )

    // Content-Disposition 헤더에서 파일명 추출
    const contentDisposition = response.headers['content-disposition']
    let fileName = defaultFileName

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, '')
        // URL 디코딩 처리
        try {
          fileName = decodeURIComponent(fileName)
        } catch {
          // 디코딩 실패 시 원본 사용
        }
      }
    }

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  },
}
