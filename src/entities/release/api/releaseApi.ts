import { apiClient } from '@/shared/api/client'
import type { ReleaseTreeResponse, ReleaseVersionDetail } from '../model/types'

export const releaseApi = {
  /** 표준 릴리즈 트리 조회 */
  getStandardTree: async (): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>('/api/releases/standard/tree')
    return response.data
  },

  /** 커스텀 릴리즈 트리 조회 */
  getCustomTree: async (customerCode: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(`/api/releases/custom/${customerCode}/tree`)
    return response.data
  },

  /** 버전 상세 조회 */
  getVersionById: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.get<ReleaseVersionDetail>(`/api/releases/versions/${id}`)
    return response.data
  },

  /** 릴리즈 파일 다운로드 */
  downloadFile: async (fileId: number, fileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(`/api/releases/files/${fileId}/download`, {
      responseType: 'blob',
    })

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
