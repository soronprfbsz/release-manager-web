import { apiClient } from '@/shared/api/client'
import type { ReleaseTreeResponse, ReleaseVersionDetail } from '../model/types'

const ENDPOINTS = {
  standardTree: '/api/releases/standard/tree',
  customTree: (customerCode: string) => `/api/releases/custom/${customerCode}/tree`,
  versionById: (id: number) => `/api/releases/versions/${id}`,
  fileDownload: (id: number) => `/api/releases/files/${id}/download`,
} as const

export const releaseApi = {
  /** 표준 릴리즈 트리 조회 */
  getStandardTree: async (): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.standardTree)
    return response
  },

  /** 커스텀 릴리즈 트리 조회 */
  getCustomTree: async (customerCode: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.customTree(customerCode))
    return response
  },

  /** 버전 상세 조회 */
  getVersionById: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.get<ReleaseVersionDetail>(ENDPOINTS.versionById(id))
    return response
  },

  /** 릴리즈 파일 다운로드 */
  downloadFile: async (id: number, fileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.fileDownload(id), {
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

  /** 릴리즈 파일 내용 조회 (텍스트) */
  getFileContent: async (id: number): Promise<string> => {
    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.fileDownload(id), {
      responseType: 'text',
    })
    return response.data
  },
}
