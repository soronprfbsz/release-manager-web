import { apiClient } from './client'
import type {
  CumulativePatchListResponse,
  CumulativePatchGenerateRequest,
  CumulativePatchDetail,
  CumulativePatch
} from './types'

export const patchApi = {
  // 누적 패치 목록 조회
  getCumulativePatches: async (): Promise<CumulativePatch[]> => {
    const response = await apiClient.get<CumulativePatchListResponse>('/api/cumulative-patches')
    return response.data.data
  },

  // 누적 패치 상세 조회
  getCumulativePatchById: async (id: number): Promise<CumulativePatchDetail> => {
    const response = await apiClient.get<CumulativePatchDetail>(`/api/cumulative-patches/${id}`)
    return response.data
  },

  // 누적 패치 생성
  generateCumulativePatch: async (request: CumulativePatchGenerateRequest): Promise<CumulativePatch> => {
    const response = await apiClient.post<CumulativePatch>('/api/cumulative-patches/generate', request)
    return response.data
  },

  // 누적 패치 파일 다운로드
  downloadPatch: async (patchId: number, fileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(`/api/cumulative-patches/${patchId}/download`, {
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
