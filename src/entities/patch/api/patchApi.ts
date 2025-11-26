import { apiClient } from '@/shared/api/client'
import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
} from '../model/types'

export const patchApi = {
  /** 패치 목록 조회 */
  getList: async (): Promise<CumulativePatch[]> => {
    const response = await apiClient.get<CumulativePatch[]>('/api/patch')
    return response.data
  },

  /** 패치 상세 조회 */
  getById: async (patchId: number): Promise<CumulativePatchDetail> => {
    const response = await apiClient.get<CumulativePatchDetail>(`/api/patch/${patchId}`)
    return response.data
  },

  /** 패치 생성 */
  generate: async (request: CumulativePatchGenerateRequest): Promise<CumulativePatch> => {
    const response = await apiClient.post<CumulativePatch>('/api/patch/generate', request)
    return response.data
  },

  /** 패치 파일 다운로드 */
  download: async (patchId: number, fileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(`/api/patch/${patchId}/download`, {
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
