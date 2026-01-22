/**
 * Project API
 * 프로젝트 관련 API
 */

import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'
import { downloadWithProgress, type DownloadProgressEvent } from '@/shared/lib/utils/download-helper'

import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  OnboardingFilesResponse,
  OnboardingFileDeleteResponse,
  OnboardingFileUploadResponse,
  OnboardingDirectoryCreateResponse,
  InstallFilesResponse,
  InstallFileDeleteResponse,
  InstallFileUploadResponse,
  InstallDirectoryCreateResponse,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/projects',
  byId: (id: string) => `/api/projects/${id}`,
  // 온보딩
  onboardingFiles: (id: string) => `/api/projects/${id}/onboardings/files`,
  onboardingDirectory: (id: string) => `/api/projects/${id}/onboardings/files/directory`,
  onboardingDownload: (id: string) => `/api/projects/${id}/onboardings/files/zip-download`,
  // 인스톨
  installFiles: (id: string) => `/api/projects/${id}/installs/files`,
  installDirectory: (id: string) => `/api/projects/${id}/installs/files/directory`,
  installDownload: (id: string) => `/api/projects/${id}/installs/files/zip-download`,
} as const

export const projectApi = {
  /** 프로젝트 목록 조회 */
  getList: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(ENDPOINTS.base)
    return response
  },

  /** 프로젝트 상세 조회 */
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(ENDPOINTS.byId(id))
    return response
  },

  /** 프로젝트 생성 */
  create: async (data: ProjectCreateRequest): Promise<Project> => {
    const response = await apiClient.post<Project>(ENDPOINTS.base, data)
    return response
  },

  /** 프로젝트 수정 */
  update: async (id: string, data: ProjectUpdateRequest): Promise<Project> => {
    const response = await apiClient.put<Project>(ENDPOINTS.byId(id), data)
    return response
  },

  /** 프로젝트 삭제 */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /** 온보딩 파일 조회 */
  getOnboardingFiles: async (id: string): Promise<OnboardingFilesResponse> => {
    const response = await apiClient.get<OnboardingFilesResponse>(ENDPOINTS.onboardingFiles(id))
    return response
  },

  /** 온보딩 전체 파일 다운로드 (ZIP) - 진행률 지원 */
  downloadOnboardingFiles: async (
    id: string,
    fileName: string,
    onProgress?: (event: DownloadProgressEvent) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.onboardingDownload(id),
      filename: fileName,
      onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
      signal,
    })
  },

  /** 온보딩 파일 업로드 */
  uploadOnboardingFile: async (
    id: string,
    file: File,
    targetPath?: string,
    extractZip?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal
  ): Promise<OnboardingFileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (targetPath) {
      formData.append('targetPath', targetPath)
    }
    if (extractZip !== undefined) {
      formData.append('extractZip', String(extractZip))
    }

    const response = await apiClient.post<OnboardingFileUploadResponse>(
      ENDPOINTS.onboardingFiles(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: API_TIMEOUT.FILE_OPERATION,
        onUploadProgress,
        signal,
      }
    )
    return response
  },

  /** 온보딩 파일 삭제 */
  deleteOnboardingFile: async (
    id: string,
    filePath: string
  ): Promise<OnboardingFileDeleteResponse> => {
    const response = await apiClient.delete<OnboardingFileDeleteResponse>(
      `${ENDPOINTS.onboardingFiles(id)}?filePath=${encodeURIComponent(filePath)}`
    )
    return response
  },

  /** 온보딩 디렉토리 생성 */
  createOnboardingDirectory: async (
    id: string,
    path: string
  ): Promise<OnboardingDirectoryCreateResponse> => {
    const response = await apiClient.post<OnboardingDirectoryCreateResponse>(
      `${ENDPOINTS.onboardingDirectory(id)}?path=${encodeURIComponent(path)}`
    )
    return response
  },

  // ============================================================================
  // Install (인스톨) 관련 API
  // ============================================================================

  /** 인스톨 파일 조회 */
  getInstallFiles: async (id: string): Promise<InstallFilesResponse> => {
    const response = await apiClient.get<InstallFilesResponse>(ENDPOINTS.installFiles(id))
    return response
  },

  /** 인스톨 전체 파일 다운로드 (ZIP) - 진행률 지원 */
  downloadInstallFiles: async (
    id: string,
    fileName: string,
    onProgress?: (event: DownloadProgressEvent) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.installDownload(id),
      filename: fileName,
      onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
      signal,
    })
  },

  /** 인스톨 파일 업로드 */
  uploadInstallFile: async (
    id: string,
    file: File,
    targetPath?: string,
    extractZip?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal
  ): Promise<InstallFileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (targetPath) {
      formData.append('targetPath', targetPath)
    }
    if (extractZip !== undefined) {
      formData.append('extractZip', String(extractZip))
    }

    const response = await apiClient.post<InstallFileUploadResponse>(
      ENDPOINTS.installFiles(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: API_TIMEOUT.FILE_OPERATION,
        onUploadProgress,
        signal,
      }
    )
    return response
  },

  /** 인스톨 파일 삭제 */
  deleteInstallFile: async (
    id: string,
    filePath: string
  ): Promise<InstallFileDeleteResponse> => {
    const response = await apiClient.delete<InstallFileDeleteResponse>(
      `${ENDPOINTS.installFiles(id)}?filePath=${encodeURIComponent(filePath)}`
    )
    return response
  },

  /** 인스톨 디렉토리 생성 */
  createInstallDirectory: async (
    id: string,
    path: string
  ): Promise<InstallDirectoryCreateResponse> => {
    const response = await apiClient.post<InstallDirectoryCreateResponse>(
      `${ENDPOINTS.installDirectory(id)}?path=${encodeURIComponent(path)}`
    )
    return response
  },
}
