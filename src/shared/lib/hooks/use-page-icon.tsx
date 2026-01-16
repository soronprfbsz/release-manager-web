/**
 * usePageIcon Hook
 * 현재 경로에 해당하는 메뉴의 아이콘을 가져오는 훅
 * 메뉴 API에서 받은 아이콘을 그대로 사용하여 네비게이션과 페이지 헤더의 아이콘 일관성 유지
 */

import * as React from 'react'

import { useLocation } from 'react-router-dom'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { getMenuIcon } from '@/shared/config/menu-icons'

/**
 * 메뉴 트리에서 경로에 해당하는 메뉴 아이템 찾기
 */
function findMenuByPath(menus: MenuItem[], path: string): MenuItem | null {
  for (const menu of menus) {
    // 정확한 경로 매칭
    if (menu.path === path) {
      return menu
    }
    // 자식 메뉴에서 찾기
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(menu.children, path)
      if (found) return found
    }
  }
  return null
}

interface UsePageIconResult {
  /** 페이지 헤더용 아이콘 (h-5 w-5) */
  icon: React.ReactNode
  /** 아이콘명 (API에서 받은 원본 값) */
  iconName: string | undefined
  /** 페이지 타이틀 (메뉴명) */
  title: string | undefined
  /** 페이지 설명 */
  description: string | undefined
  /** 메뉴 아이템 정보 */
  menuItem: MenuItem | null
}

/**
 * 현재 경로에 해당하는 메뉴의 아이콘을 가져오는 훅
 * @param customPath 특정 경로를 지정하고 싶을 때 사용 (기본값: 현재 location.pathname)
 * @returns 페이지 헤더용 아이콘과 메뉴 아이템 정보
 */
export function usePageIcon(customPath?: string): UsePageIconResult {
  const location = useLocation()
  const { data: menus = [] } = useMenus()

  const path = customPath ?? location.pathname

  const menuItem = React.useMemo(() => {
    return findMenuByPath(menus, path)
  }, [menus, path])

  const icon = React.useMemo(() => {
    if (!menuItem?.icon) return null
    return getMenuIcon(menuItem.icon, 'h-5 w-5')
  }, [menuItem?.icon])

  return {
    icon,
    iconName: menuItem?.icon,
    title: menuItem?.label,
    description: menuItem?.description,
    menuItem,
  }
}

