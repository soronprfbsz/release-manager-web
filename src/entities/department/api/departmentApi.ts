import { apiClient } from '@/shared/api/client'

import type { Department } from '../model/types'

const ENDPOINTS = {
  base: '/api/departments',
} as const

export const departmentApi = {
  /** 부서 목록 조회 */
  getList: async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>(ENDPOINTS.base)
    return response
  },
}
