import { apiClient } from '@/shared/api/client'

import type { CodeSimpleResponse } from '../model/types'

const ENDPOINTS = {
  codesByType: (id: string) => `/api/codes/${id}`,
} as const

export const codeApi = {
  /**
   * 코드 타입별 코드 목록 조회
   * @param id 코드 타입 ID (e.g. RELEASE_CATEGORY, FILE_CATEGORY 등)
   * @returns 코드 간단 응답 목록
   */
  getCodesByType: async (id: string): Promise<CodeSimpleResponse[]> => {
    const response = await apiClient.get<CodeSimpleResponse[]>(ENDPOINTS.codesByType(id))
    return response
  },
}
