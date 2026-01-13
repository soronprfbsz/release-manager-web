/**
 * CustomerNote API
 * 고객사 특이사항 API
 */

import { apiClient } from '@/shared/api/client'

import type {
  CustomerNote,
  CustomerNoteCreateRequest,
  CustomerNoteUpdateRequest,
} from '../model/types'

const ENDPOINTS = {
  list: (customerId: number) => `/api/customers/${customerId}/notes`,
  byId: (customerId: number, noteId: number) =>
    `/api/customers/${customerId}/notes/${noteId}`,
} as const

export const customerNoteApi = {
  /** 고객사 특이사항 목록 조회 */
  getList: async (customerId: number): Promise<CustomerNote[]> => {
    const response = await apiClient.get<CustomerNote[]>(ENDPOINTS.list(customerId))
    return response
  },

  /** 고객사 특이사항 생성 */
  create: async (
    customerId: number,
    request: CustomerNoteCreateRequest
  ): Promise<CustomerNote> => {
    const response = await apiClient.post<CustomerNote>(
      ENDPOINTS.list(customerId),
      request
    )
    return response
  },

  /** 고객사 특이사항 수정 */
  update: async (
    customerId: number,
    noteId: number,
    request: CustomerNoteUpdateRequest
  ): Promise<CustomerNote> => {
    const response = await apiClient.put<CustomerNote>(
      ENDPOINTS.byId(customerId, noteId),
      request
    )
    return response
  },

  /** 고객사 특이사항 삭제 */
  delete: async (customerId: number, noteId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(customerId, noteId))
  },
}
