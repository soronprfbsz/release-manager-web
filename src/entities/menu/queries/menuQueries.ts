/**
 * Menu Queries
 * 메뉴 React Query 훅
 */

import { useQuery } from '@tanstack/react-query'

import { menuApi } from '../api/menuApi'

export const menuKeys = {
  all: ['menus'] as const,
  list: () => [...menuKeys.all, 'list'] as const,
}

/**
 * 메뉴 목록 조회 훅
 */
export function useMenus() {
  return useQuery({
    queryKey: menuKeys.list(),
    queryFn: menuApi.getList,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  })
}
