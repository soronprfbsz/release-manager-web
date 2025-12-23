/**
 * Menu Icons Configuration
 * 메뉴 아이콘 중앙 집중 관리
 *
 * NavigationBar와 각 페이지 헤더에서 동일한 아이콘을 사용하도록 함
 */

import * as React from 'react'

import {
  Terminal,
  Server,
  Package,
  GitBranch,
  Users,
  Building2,
  User,
  FolderKanban,
  FileDiff,
  Layers,
} from 'lucide-react'
import { GrResources } from 'react-icons/gr'
import { SiMariadb } from 'react-icons/si'

/**
 * 아이콘 설정 타입
 */
interface IconConfig {
  icon: React.ReactNode
  iconLarge: React.ReactNode  // 페이지 헤더용 (h-5 w-5)
}

/**
 * menuId → 아이콘 매핑
 * 각 페이지 헤더와 동일한 아이콘 사용
 */
const menuIconConfig: Record<string, IconConfig> = {
  // 원격 작업
  remote_mariadb: {
    icon: <SiMariadb className="h-4 w-4" />,
    iconLarge: <SiMariadb className="h-5 w-5 text-primary" />,
  },
  remote_terminal: {
    icon: <Terminal className="h-4 w-4" />,
    iconLarge: <Terminal className="h-5 w-5 text-primary" />,
  },

  // 인프라
  infrastructure_resources: {
    icon: <GrResources className="h-4 w-4" />,
    iconLarge: <GrResources className="h-5 w-5 text-primary" />,
  },
  infrastructure_services: {
    icon: <Server className="h-4 w-4" />,
    iconLarge: <Server className="h-5 w-5 text-primary" />,
  },

  // 버전/패치 관리
  version_standard: {
    icon: <Package className="h-4 w-4" />,
    iconLarge: <Package className="h-5 w-5 text-primary" />,
  },
  version_custom: {
    icon: <GitBranch className="h-4 w-4" />,
    iconLarge: <GitBranch className="h-5 w-5 text-primary" />,
  },
  patch_standard: {
    icon: <Package className="h-4 w-4" />,
    iconLarge: <Package className="h-5 w-5 text-primary" />,
  },
  patch_custom: {
    icon: <GitBranch className="h-4 w-4" />,
    iconLarge: <GitBranch className="h-5 w-5 text-primary" />,
  },
  patch_generate: {
    icon: <Layers className="h-4 w-4" />,
    iconLarge: <Layers className="h-5 w-5 text-primary" />,
  },
  patch_history: {
    icon: <Layers className="h-4 w-4" />,
    iconLarge: <Layers className="h-5 w-5 text-primary" />,
  },

  // 운영 관리
  operation_customers: {
    icon: <Building2 className="h-4 w-4" />,
    iconLarge: <Building2 className="h-5 w-5 text-primary" />,
  },
  operation_engineers: {
    icon: <Users className="h-4 w-4" />,
    iconLarge: <Users className="h-5 w-5 text-primary" />,
  },
  operation_accounts: {
    icon: <User className="h-4 w-4" />,
    iconLarge: <User className="h-5 w-5 text-primary" />,
  },
  operation_projects: {
    icon: <FolderKanban className="h-4 w-4" />,
    iconLarge: <FolderKanban className="h-5 w-5 text-primary" />,
  },
  operation_filesync: {
    icon: <FileDiff className="h-4 w-4" />,
    iconLarge: <FileDiff className="h-5 w-5 text-primary" />,
  },
}

/**
 * path → menuId 매핑 (페이지에서 사용)
 */
const pathToMenuId: Record<string, string> = {
  '/development-support/remote-jobs/mariadb': 'remote_mariadb',
  '/development-support/remote-jobs/terminal': 'remote_terminal',
  '/development-support/infrastructure/resources': 'infrastructure_resources',
  '/development-support/infrastructure/services': 'infrastructure_services',
  '/releases/standard': 'version_standard',
  '/releases/custom': 'version_custom',
  '/patches/standard': 'patch_standard',
  '/patches/custom': 'patch_custom',
  '/patches/generate': 'patch_generate',
  '/patches/history': 'patch_history',
  '/operations/customers': 'operation_customers',
  '/operations/engineers': 'operation_engineers',
  '/operations/accounts': 'operation_accounts',
  '/operations/projects': 'operation_projects',
  '/operations/file-sync': 'operation_filesync',
}

/**
 * menuId로 네비게이션 메뉴용 아이콘 가져오기
 */
export function getMenuIconById(menuId: string): React.ReactNode {
  return menuIconConfig[menuId]?.icon || null
}

/**
 * menuId로 페이지 헤더용 아이콘 가져오기
 */
export function getPageIconById(menuId: string): React.ReactNode {
  return menuIconConfig[menuId]?.iconLarge || null
}

/**
 * path로 페이지 헤더용 아이콘 가져오기
 */
export function getPageIconByPath(path: string): React.ReactNode {
  const menuId = pathToMenuId[path]
  if (!menuId) return null
  return menuIconConfig[menuId]?.iconLarge || null
}

/**
 * path로 menuId 가져오기
 */
export function getMenuIdByPath(path: string): string | undefined {
  return pathToMenuId[path]
}
