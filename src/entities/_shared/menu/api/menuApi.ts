/**
 * Menu API
 * 메뉴 API 클라이언트
 */

import { apiClient } from '@/shared/api/client'
import { convertMenuResponseToMenuItem, type MenuItem } from '@/shared/lib/menu-mapper'

import type { MenuResponse } from '../model/types'

const ENDPOINTS = {
  list: '/api/menus',
} as const

export const menuApi = {
  /**
   * 메뉴 목록 조회
   */
  getList: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuResponse[]>(ENDPOINTS.list)
    return response.map(convertMenuResponseToMenuItem)
  },
}
