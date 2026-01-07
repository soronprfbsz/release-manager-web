/**
 * Menu Mapper
 * 메뉴 응답 데이터를 내비게이션 메뉴 아이템으로 변환
 */

/**
 * 메뉴 아이템 인터페이스
 */
export interface MenuItem {
  menuId: string
  label: string
  icon?: string              // 아이콘명 (Lucide React)
  isIconVisible?: boolean    // 아이콘 표시 여부
  description?: string
  isDescriptionVisible?: boolean
  isLineBreak?: boolean
  path?: string
  children?: MenuItem[]
}

/**
 * 메뉴 응답 데이터를 내비게이션 메뉴 아이템으로 변환
 */
export function convertMenuResponseToMenuItem(menu: {
  menuId: string
  menuName: string
  menuUrl?: string
  icon?: string
  isIconVisible?: boolean
  description?: string
  isDescriptionVisible?: boolean
  isLineBreak?: boolean
  children: any[]
}): MenuItem {
  return {
    menuId: menu.menuId,
    label: menu.menuName,
    icon: menu.icon,
    isIconVisible: menu.isIconVisible,
    description: menu.description,
    isDescriptionVisible: menu.isDescriptionVisible,
    isLineBreak: menu.isLineBreak,
    path: menu.menuUrl ? (menu.menuUrl.startsWith('/') ? menu.menuUrl : `/${menu.menuUrl}`) : undefined,
    children: menu.children?.map(convertMenuResponseToMenuItem),
  }
}
