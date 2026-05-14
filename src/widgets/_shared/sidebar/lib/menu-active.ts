/**
 * Sidebar 메뉴 path 활성 판정 헬퍼.
 *
 * isPathActive       — 현재 path 가 target path 와 일치 또는 그 하위인지.
 * hasActiveDescendant — 메뉴 트리에서 자기 자신 또는 자손이 활성 상태인지.
 */

import { type MenuItem } from '@/entities/_shared/menu'

export function isPathActive(currentPath: string, targetPath?: string): boolean {
  if (!targetPath) return false
  if (targetPath === '/') return currentPath === '/'
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
}

export function hasActiveDescendant(item: MenuItem, currentPath: string): boolean {
  if (isPathActive(currentPath, item.path)) return true
  if (item.children) {
    return item.children.some((c) => hasActiveDescendant(c, currentPath))
  }
  return false
}
