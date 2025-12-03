import { apiClient } from '@/shared/api/client'
import type { CodeSimpleResponse } from '../model/types'

const ENDPOINTS = {
  codesByType: (codeTypeId: string) => `/api/codes/${codeTypeId}`,
} as const

export const codeApi = {
  /**
   * 코드 타입별 코드 목록 조회
   * @param codeTypeId 코드 타입 ID (예: RELEASE_CATEGORY, FILE_CATEGORY 등)
   * @returns 코드 간단 응답 목록
   */
  getCodesByType: async (codeTypeId: string): Promise<CodeSimpleResponse[]> => {
    const response = await apiClient.get<CodeSimpleResponse[]>(ENDPOINTS.codesByType(codeTypeId))
    return response
  },
}
