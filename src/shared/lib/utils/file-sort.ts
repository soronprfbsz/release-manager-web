/**
 * File Sort Utility
 * 파일 트리 소팅 유틸리티
 */

/** 소팅 기준 */
export type FileSortBy = 'name' | 'modifiedAt' | 'size'

/** 소팅 방향 */
export type FileSortDirection = 'asc' | 'desc'

/** 소팅 옵션 */
export interface FileSortOption {
  sortBy: FileSortBy
  direction: FileSortDirection
}

/** 소팅 옵션 기본값 */
export const DEFAULT_FILE_SORT: FileSortOption = {
  sortBy: 'name',
  direction: 'asc',
}

/** 소팅 옵션 라벨 */
export const FILE_SORT_OPTIONS: Array<{
  value: string
  label: string
  sortBy: FileSortBy
  direction: FileSortDirection
}> = [
  { value: 'name-asc', label: '이름 (A→Z)', sortBy: 'name', direction: 'asc' },
  { value: 'name-desc', label: '이름 (Z→A)', sortBy: 'name', direction: 'desc' },
  { value: 'modifiedAt-desc', label: '수정일 (최신순)', sortBy: 'modifiedAt', direction: 'desc' },
  { value: 'modifiedAt-asc', label: '수정일 (오래된순)', sortBy: 'modifiedAt', direction: 'asc' },
  { value: 'size-desc', label: '크기 (큰순)', sortBy: 'size', direction: 'desc' },
  { value: 'size-asc', label: '크기 (작은순)', sortBy: 'size', direction: 'asc' },
]

/** 파일 노드 타입 (공통 인터페이스) */
interface SortableFileNode {
  name: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: string
  children?: SortableFileNode[]
}

/**
 * 파일 노드 배열을 소팅
 * @param nodes - 소팅할 파일 노드 배열
 * @param sortBy - 소팅 기준
 * @param direction - 소팅 방향
 * @returns 소팅된 파일 노드 배열
 */
export function sortFileNodes<T extends SortableFileNode>(
  nodes: T[],
  sortBy: FileSortBy,
  direction: FileSortDirection
): T[] {
  return [...nodes].sort((a, b) => {
    // 디렉토리 우선 정렬 (항상 적용)
    if (a.type === 'directory' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'directory') return 1

    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ko')
        break

      case 'modifiedAt': {
        const dateA = a.modifiedAt ? new Date(a.modifiedAt).getTime() : 0
        const dateB = b.modifiedAt ? new Date(b.modifiedAt).getTime() : 0
        comparison = dateA - dateB
        break
      }

      case 'size': {
        const sizeA = a.size ?? 0
        const sizeB = b.size ?? 0
        comparison = sizeA - sizeB
        break
      }

      default:
        comparison = a.name.localeCompare(b.name, 'ko')
    }

    return direction === 'desc' ? -comparison : comparison
  })
}

/**
 * 파일 트리를 재귀적으로 소팅
 * @param node - 루트 노드
 * @param sortBy - 소팅 기준
 * @param direction - 소팅 방향
 * @returns 소팅된 트리
 */
export function sortFileTree<T extends SortableFileNode>(
  node: T,
  sortBy: FileSortBy,
  direction: FileSortDirection
): T {
  if (!node.children || node.children.length === 0) {
    return node
  }

  const sortedChildren = sortFileNodes(node.children as T[], sortBy, direction).map(
    (child) => sortFileTree(child, sortBy, direction)
  )

  return {
    ...node,
    children: sortedChildren,
  }
}
