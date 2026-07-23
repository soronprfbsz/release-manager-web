/**
 * SiteNote API
 * 사이트 특이사항 API
 */

import { apiClient } from '@/shared/api/client'

import type {
  SiteNote,
  SiteNoteCreateRequest,
  SiteNoteUpdateRequest,
} from '../model/types'

const ENDPOINTS = {
  list: (siteId: number) => `/api/sites/${siteId}/notes`,
  byId: (siteId: number, noteId: number) =>
    `/api/sites/${siteId}/notes/${noteId}`,
} as const

export const siteNoteApi = {
  /** 사이트 특이사항 목록 조회 */
  getList: async (siteId: number): Promise<SiteNote[]> => {
    const response = await apiClient.get<SiteNote[]>(ENDPOINTS.list(siteId))
    return response
  },

  /** 사이트 특이사항 생성 */
  create: async (
    siteId: number,
    request: SiteNoteCreateRequest
  ): Promise<SiteNote> => {
    const response = await apiClient.post<SiteNote>(
      ENDPOINTS.list(siteId),
      request
    )
    return response
  },

  /** 사이트 특이사항 수정 */
  update: async (
    siteId: number,
    noteId: number,
    request: SiteNoteUpdateRequest
  ): Promise<SiteNote> => {
    const response = await apiClient.put<SiteNote>(
      ENDPOINTS.byId(siteId, noteId),
      request
    )
    return response
  },

  /** 사이트 특이사항 삭제 */
  delete: async (siteId: number, noteId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(siteId, noteId))
  },
}
