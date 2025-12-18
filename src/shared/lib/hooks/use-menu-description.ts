import { useLocation } from 'react-router-dom'

import { useMenus, type MenuItem } from '@/entities/menu'

/**
 * 현재 경로에 해당하는 메뉴의 description을 찾는 훅
 */
export function useMenuDescription(): string | undefined {
  const location = useLocation()
  const { data: menusData } = useMenus()

  if (!menusData) return undefined

  // 재귀적으로 메뉴를 순회하며 현재 경로와 일치하는 메뉴 찾기
  const findMenuByPath = (items: MenuItem[]): MenuItem | undefined => {
    for (const item of items) {
      // 현재 아이템의 path 확인 (path가 있고 현재 경로와 일치하는 경우)
      if (item.path && location.pathname === item.path) {
        return item
      }

      // children이 있으면 재귀적으로 탐색
      if (item.children && item.children.length > 0) {
        const found = findMenuByPath(item.children)
        if (found) return found
      }
    }
    return undefined
  }

  const currentMenu = findMenuByPath(menusData)
  return currentMenu?.description
}
