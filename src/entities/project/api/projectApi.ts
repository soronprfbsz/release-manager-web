/**
 * Project API
 * 프로젝트 관련 API
 */

import { apiClient } from '@/shared/api/client'

import type { Project } from '../model/types'

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
}
