import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'
import type { ReleaseTreeResponse, ReleaseVersionDetail, ReleaseFileStructure } from '../model/types'

const ENDPOINTS = {
  standardTree: '/api/releases/standard/tree',
  customTree: (customerCode: string) => `/api/releases/custom/${customerCode}/tree`,
  versionById: (id: number) => `/api/releases/versions/${id}`,
  versionFiles: (id: number) => `/api/releases/versions/${id}/files`,
  fileDownload: (id: number) => `/api/releases/files/${id}/download`,
  versionDownload: (id: number) => `/api/releases/versions/${id}/download`,
  createVersion: '/api/releases/standard/versions',
  deleteVersion: (id: number) => `/api/releases/versions/${id}`,
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
  downloadFile: async (
    id: number,
    fileName: string,
    onDownloadProgress?: (progressEvent: { loaded: number; total?: number; isApproximate?: boolean }) => void
  ): Promise<void> => {
    // X-Uncompressed-Size 헤더를 읽기 위한 변수
    let uncompressedSize: number | undefined

    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.fileDownload(id), {
      responseType: 'blob',
      timeout: API_TIMEOUT.FILE_OPERATION,
      onDownloadProgress: (progressEvent) => {
        // 첫 진행률 이벤트에서 X-Uncompressed-Size 헤더 읽기
        if (!uncompressedSize && response.headers) {
          const headerValue = response.headers['x-uncompressed-size']
          if (headerValue) {
            uncompressedSize = parseInt(headerValue, 10)
          }
        }

        // 압축 전 크기를 total로 사용하여 대략적인 진행률 표시
        if (onDownloadProgress) {
          onDownloadProgress({
            loaded: progressEvent.loaded,
            total: uncompressedSize || progressEvent.total,
            isApproximate: !!uncompressedSize, // X-Uncompressed-Size 사용 시 대략적 진행률
          })
        }
      },
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

  /** 버전 생성 (multipart/form-data) */
  createVersion: async (
    version: string,
    comment: string,
    patchFiles: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('version', version)
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)

    await apiClient.upload(ENDPOINTS.createVersion, formData, {
      onUploadProgress,
      timeout: API_TIMEOUT.FILE_OPERATION
    })
  },

  /** 버전 삭제 */
  deleteVersion: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.deleteVersion(id))
  },

  /** 버전 파일 트리 구조 조회 */
  getVersionFileStructure: async (id: number): Promise<ReleaseFileStructure> => {
    const response = await apiClient.get<ReleaseFileStructure>(ENDPOINTS.versionFiles(id))
    return response
  },

  /** 버전 전체 다운로드 (ZIP) - 스트리밍 방식 */
  downloadVersion: async (
    id: number,
    fileName: string,
    onDownloadProgress?: (progressEvent: { loaded: number; total?: number; isApproximate?: boolean }) => void
  ): Promise<void> => {
    // X-Uncompressed-Size 헤더를 읽기 위한 변수
    let uncompressedSize: number | undefined

    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.versionDownload(id), {
      responseType: 'blob',
      timeout: API_TIMEOUT.FILE_OPERATION,
      onDownloadProgress: (progressEvent) => {
        // 첫 진행률 이벤트에서 X-Uncompressed-Size 헤더 읽기
        if (!uncompressedSize && response.headers) {
          const headerValue = response.headers['x-uncompressed-size']
          if (headerValue) {
            uncompressedSize = parseInt(headerValue, 10)
          }
        }

        // 압축 전 크기를 total로 사용하여 대략적인 진행률 표시
        if (onDownloadProgress) {
          onDownloadProgress({
            loaded: progressEvent.loaded,
            total: uncompressedSize || progressEvent.total,
            isApproximate: !!uncompressedSize, // X-Uncompressed-Size 사용 시 대략적 진행률
          })
        }
      },
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
