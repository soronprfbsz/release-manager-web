/**
 * Menu Mapper
 * 메뉴 ID를 라우트 경로로 매핑하는 서비스
 */

import { ROUTES } from '@/shared/config/constants'

import type { MenuId } from '@/entities/menu'

/**
 * 메뉴 ID를 라우트 경로로 변환
 */
export function menuIdToPath(menuId: string): string | undefined {
  const menuIdMap: Record<MenuId, string | undefined> = {
    // 버전 관리
    version_management: undefined,
    version_standard: ROUTES.RELEASES.STANDARD,
    version_custom: ROUTES.RELEASES.CUSTOM,

    // 패치 관리
    patch_management: undefined,
    patch_standard: ROUTES.PATCHES.STANDARD,
    patch_custom: ROUTES.PATCHES.CUSTOM,

    // 운영 관리
    operation_management: undefined,
    operation_customer: ROUTES.OPERATIONS.CUSTOMERS,
    operation_engineer: ROUTES.OPERATIONS.ENGINEERS,
    operation_account: ROUTES.OPERATIONS.ACCOUNTS,

    // 작업 관리
    job_management: undefined,
    job_mariadb: ROUTES.JOBS.MARIADB,
    job_terminal: undefined,

    // 리소스 관리
    resource_management: ROUTES.RESOURCES.ROOT,
  }

  return menuIdMap[menuId as MenuId]
}

/**
 * 메뉴 응답 데이터를 내비게이션 메뉴 아이템으로 변환
 */
export interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
}

export function convertMenuResponseToMenuItem(menu: { menuId: string; menuName: string; children: any[] }): MenuItem {
  return {
    label: menu.menuName,
    path: menuIdToPath(menu.menuId),
    children: menu.children?.map(convertMenuResponseToMenuItem),
  }
}
