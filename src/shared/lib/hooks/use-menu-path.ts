import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

import { useMenus, type MenuItem } from '@/entities/menu'

export interface MenuPathItem {
  label: string
  path?: string
}

/**
 * 현재 경로에 해당하는 메뉴의 전체 경로를 찾는 훅
 * 예: [{ label: "개발 지원" }, { label: "원격 작업" }, { label: "MariaDB", path: "/..." }]
 */
export function useMenuPath(): MenuPathItem[] {
  const location = useLocation()
  const { data: menusData } = useMenus()

  return useMemo(() => {
    if (!menusData) return []

    // 재귀적으로 메뉴를 순회하며 현재 경로와 일치하는 메뉴 찾기
    const findMenuPath = (items: MenuItem[], parents: MenuPathItem[] = []): MenuPathItem[] | null => {
      for (const item of items) {
        const currentPath: MenuPathItem[] = [...parents, { label: item.label, path: item.path }]

        // 현재 아이템의 path 확인
        if (item.path && location.pathname === item.path) {
          return currentPath
        }

        // children이 있으면 재귀적으로 탐색
        if (item.children && item.children.length > 0) {
          const found = findMenuPath(item.children, currentPath)
          if (found) return found
        }
      }
      return null
    }

    const menuPath = findMenuPath(menusData)
    return menuPath || []
  }, [menusData, location.pathname])
}
