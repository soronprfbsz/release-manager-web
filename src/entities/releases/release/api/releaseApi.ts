import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'

import type { ReleaseTreeResponse, ReleaseVersionDetail, ReleaseFileStructure, CustomReleaseTreeResponse, StandardVersionSimple } from '../model/types'

const ENDPOINTS = {
  standardTree: (id: string) => `/api/releases/projects/${id}/standard/tree`,
  standardVersionList: (id: string) => `/api/releases/projects/${id}/versions`,
  customTree: (id: string, customerCode: string) => `/api/releases/projects/${id}/custom/${customerCode}/tree`,
  allCustomTree: (id: string) => `/api/releases/projects/${id}/custom/tree`,
  versionById: (id: number) => `/api/releases/versions/${id}`,
  versionFiles: (id: number) => `/api/releases/versions/${id}/files`,
  fileDownload: (id: number) => `/api/releases/files/${id}/download`,
  versionDownload: (id: number) => `/api/releases/versions/${id}/download`,
  createVersion: '/api/releases/versions/standard',
  createCustomVersion: '/api/releases/versions/custom',
  deleteVersion: (id: number) => `/api/releases/versions/${id}`,
  approveVersion: (id: number) => `/api/releases/versions/${id}/approve`,
  // 핫픽스 관련 엔드포인트
  createHotfix: (id: number) => `/api/releases/versions/${id}/hotfix`,
  getHotfixes: (id: number) => `/api/releases/versions/${id}/hotfixes`,
} as const

export const releaseApi = {
  /** 표준 릴리즈 트리 조회 */
  getStandardTree: async (projectId: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.standardTree(projectId))
    return response
  },

  /** 표준본 버전 목록 조회 (셀렉트박스용) */
  getStandardVersionList: async (projectId: string): Promise<StandardVersionSimple[]> => {
    const response = await apiClient.get<StandardVersionSimple[]>(ENDPOINTS.standardVersionList(projectId))
    return response
  },

  /** 커스텀 릴리즈 트리 조회 (특정 고객사) */
  getCustomTree: async (projectId: string, customerCode: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.customTree(projectId, customerCode))
    return response
  },

  /** 전체 커스텀 릴리즈 트리 조회 (모든 고객사) */
  getAllCustomTree: async (projectId: string): Promise<CustomReleaseTreeResponse> => {
    const response = await apiClient.get<CustomReleaseTreeResponse>(ENDPOINTS.allCustomTree(projectId))
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

  /** 릴리즈 파일 내용 조회 (Blob - PDF용) */
  getFileBlob: async (id: number): Promise<Blob> => {
    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.fileDownload(id), {
      responseType: 'blob',
    })
    return response.data
  },

  /** 표준 버전 생성 (multipart/form-data) */
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

  /** 커스텀 버전 생성 (multipart/form-data) - releaseCategory는 PATCH로 고정 */
  createCustomVersion: async (
    projectId: string,
    customerId: number,
    customVersion: string,
    comment: string,
    patchFiles: File,
    isApproved?: boolean,
    customBaseVersionId?: number,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('customerId', String(customerId))
    formData.append('customVersion', customVersion)
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)
    if (isApproved !== undefined) {
      formData.append('isApproved', String(isApproved))
    }
    if (customBaseVersionId !== undefined) {
      formData.append('customBaseVersionId', String(customBaseVersionId))
    }

    await apiClient.upload(ENDPOINTS.createCustomVersion, formData, {
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

  /** 핫픽스 생성 (multipart/form-data) */
  createHotfix: async (
    projectId: string,
    hotfixBaseVersionId: number,
    comment: string,
    patchFiles: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<ReleaseVersionDetail> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('hotfixBaseVersionId', String(hotfixBaseVersionId))
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)

    const response = await apiClient.upload<ReleaseVersionDetail>(
      ENDPOINTS.createHotfix(hotfixBaseVersionId),
      formData,
      {
        onUploadProgress,
        timeout: API_TIMEOUT.FILE_OPERATION
      }
    )
    return response
  },

  /** 특정 버전의 핫픽스 목록 조회 */
  getHotfixes: async (versionId: number): Promise<ReleaseVersionDetail[]> => {
    const response = await apiClient.get<ReleaseVersionDetail[]>(ENDPOINTS.getHotfixes(versionId))
    return response
  },
}
