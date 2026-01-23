/**
 * Topic API
 * 게시판 토픽 관련 API
 */

import { apiClient } from '@/shared/api/client'

import type { Topic } from '../model/types'

const ENDPOINTS = {
  base: '/api/board/topics',
  byId: (id: string) => `/api/board/topics/${id}`,
} as const

export const topicApi = {
  /** 토픽 목록 조회 */
  getList: async (): Promise<Topic[]> => {
    return await apiClient.get<Topic[]>(ENDPOINTS.base)
  },

  /** 토픽 상세 조회 (by id) */
  getById: async (id: string): Promise<Topic> => {
    return await apiClient.get<Topic>(ENDPOINTS.byId(id))
  },
}
