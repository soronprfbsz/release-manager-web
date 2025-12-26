import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'

import type { ReleaseTreeResponse, ReleaseVersionDetail, ReleaseFileStructure } from '../model/types'

const ENDPOINTS = {
  standardTree: (id: string) => `/api/releases/projects/${id}/standard/tree`,
  customTree: (id: string, customerCode: string) => `/api/releases/projects/${id}/custom/${customerCode}/tree`,
  versionById: (id: number) => `/api/releases/versions/${id}`,
  versionFiles: (id: number) => `/api/releases/versions/${id}/files`,
  fileDownload: (id: number) => `/api/releases/files/${id}/download`,
  versionDownload: (id: number) => `/api/releases/versions/${id}/download`,
  createVersion: '/api/releases/standard/versions',
  deleteVersion: (id: number) => `/api/releases/versions/${id}`,
  approveVersion: (id: number) => `/api/releases/versions/${id}/approve`,
} as const

export const releaseApi = {
  /** 표준 릴리즈 트리 조회 */
  getStandardTree: async (projectId: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.standardTree(projectId))
    return response
  },

  /** 커스텀 릴리즈 트리 조회 */
  getCustomTree: async (projectId: string, customerCode: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.customTree(projectId, customerCode))
    return response
  },

  /** 버전 상세 조회 */
  getVersionById: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.get<ReleaseVersionDetail>(ENDPOINTS.versionById(id))
    return response
  },

  /** 릴리즈 파일 다운로드 */
  downloadFile: async (id: number, fileName: string): Promise<void> => {
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL}${ENDPOINTS.fileDownload(id)}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    projectId: string,
    version: string,
    comment: string,
    releaseCategory: string,
    patchFiles: File,
    isApproved?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('version', version)
    formData.append('comment', comment)
    formData.append('releaseCategory', releaseCategory)
    formData.append('patchFiles', patchFiles)
    if (isApproved !== undefined) {
      formData.append('isApproved', String(isApproved))
    }

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

  /** 버전 전체 다운로드 (ZIP) */
  downloadVersion: async (id: number, fileName: string): Promise<void> => {
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL}${ENDPOINTS.versionDownload(id)}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /** 버전 승인 */
  approveVersion: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.patch<ReleaseVersionDetail>(ENDPOINTS.approveVersion(id))
    return response
  },
}
