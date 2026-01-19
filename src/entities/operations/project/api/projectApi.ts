/**
 * Project API
 * 프로젝트 관련 API
 */

import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'
import { downloadWithProgress, type DownloadProgressEvent } from '@/shared/lib/utils/download-helper'

import type { Project, ProjectCreateRequest, ProjectUpdateRequest, OnboardingFilesResponse } from '../model/types'

const ENDPOINTS = {
  base: '/api/projects',
  byId: (id: string) => `/api/projects/${id}`,
  onboardingFiles: (id: string) => `/api/projects/${id}/files`,
  onboardingDownload: (id: string) => `/api/projects/${id}/onboarding/download`,
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
    onProgress?: (event: DownloadProgressEvent) => void
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.onboardingDownload(id),
      filename: fileName,
      onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
    })
  },
}
