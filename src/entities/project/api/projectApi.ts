/**
 * Project API
 * 프로젝트 관련 API
 */

import { apiClient } from '@/shared/api/client'

import type { Project, ProjectCreateRequest, ProjectUpdateRequest } from '../model/types'

const ENDPOINTS = {
  base: '/api/projects',
  byId: (id: string) => `/api/projects/${id}`,
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
}
