/**
 * Department Tree Component
 * 부서 트리 뷰 컴포넌트 (드래그 앤 드롭 지원 - 순서 변경 포함)
 */

import { useState, useRef } from 'react'

import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  UsersRound,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  UserPlus,
} from 'lucide-react'

import type { DepartmentTree as DepartmentTreeType } from '@/entities/_shared/department'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

/** 드롭 위치 타입 */
export type DropPosition = 'before' | 'child' | 'after'

/** 드롭 정보 */
export interface DropInfo {
  targetId: number
  position: DropPosition
  /** position이 'before' 또는 'after'일 때 부모 부서 ID */
  parentId: number | null
  /** 해당 위치에서의 sortOrder */
  sortOrder: number
}

interface DepartmentTreeProps {
  data: DepartmentTreeType[]
  selectedId: number | null
  dropTargetId?: number | null
  dropPosition?: DropPosition | null
  /** 현재 드래그 중인 부서 ID (sortOrder 계산 시 제외하기 위해) */
  draggedDepartmentId?: number | null
  /** 계정 드래그 중 여부 (순서 변경 불가, 오직 부서 내부로만 이동 가능) */
  isDraggingAccount?: boolean
  onSelect: (department: DepartmentTreeType) => void
  onCreateChild: (parentId: number) => void
  onAssignAccount: (departmentId: number) => void
  onEdit: (department: DepartmentTreeType) => void
  onDelete: (department: DepartmentTreeType) => void
  // Department drag handlers
  onDepartmentDragStart?: (department: DepartmentTreeType) => void
  onDepartmentDragEnd?: () => void
  // Common drop handlers (for both account and department)
  onDragOver?: (departmentId: number, position: DropPosition) => void
  onDragLeave?: () => void
  onDrop?: (dropInfo: DropInfo) => void
}

interface TreeNodeProps {
  node: DepartmentTreeType
  level: number
  parentId: number | null
  siblings: DepartmentTreeType[]
  selectedId: number | null
  dropTargetId?: number | null
  dropPosition?: DropPosition | null
  draggedDepartmentId?: number | null
  isDraggingAccount?: boolean
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  onSelect: (department: DepartmentTreeType) => void
  onCreateChild: (parentId: number) => void
  onAssignAccount: (departmentId: number) => void
  onEdit: (department: DepartmentTreeType) => void
  onDelete: (department: DepartmentTreeType) => void
  onDepartmentDragStart?: (department: DepartmentTreeType) => void
  onDepartmentDragEnd?: () => void
  onDragOver?: (departmentId: number, position: DropPosition) => void
  onDragLeave?: () => void
  onDrop?: (dropInfo: DropInfo) => void
}

function TreeNode({
  node,
  level,
  parentId,
  siblings,
  selectedId,
  dropTargetId,
  dropPosition,
  draggedDepartmentId,
  isDraggingAccount,
  expandedIds,
  onToggleExpand,
  onSelect,
  onCreateChild,
  onAssignAccount,
  onEdit,
  onDelete,
  onDepartmentDragStart,
  onDepartmentDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: TreeNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedIds.has(node.departmentId)
  const isSelected = selectedId === node.departmentId
  const isDropTarget = dropTargetId === node.departmentId
  const isRootDepartment = node.depth === 0
  const isDraggable = !isRootDepartment

  // 드래그 중인 부서를 제외한 형제 목록에서의 인덱스 계산
  // 백엔드에서도 드래그 부서를 제외하고 정렬하므로 동일한 기준 사용
  const siblingsExcludingDragged = draggedDepartmentId
    ? siblings.filter((s) => s.departmentId !== draggedDepartmentId)
    : siblings
  const nodeIndexExcludingDragged = siblingsExcludingDragged.findIndex(
    (s) => s.departmentId === node.departmentId
  )

  /**
   * 드롭 시 목표 위치(sortOrder) 계산
   * - 백엔드에서 드래그 부서를 제외한 형제 목록에서 1부터 순차적으로 재정렬
   * - before: 현재 노드 위치 (해당 위치에 삽입하면 기존 노드들이 뒤로 밀림)
   * - after: 현재 노드 위치 + 1
   * - child: 자식 목록의 맨 뒤 (자식 수 + 1, 드래그 부서 제외)
   */
  const calculateSortOrder = (position: DropPosition): number => {
    if (position === 'child') {
      // 자식으로 추가: 드래그 부서를 제외한 자식 목록의 맨 뒤
      const childrenExcludingDragged = draggedDepartmentId
        ? (node.children ?? []).filter((c) => c.departmentId !== draggedDepartmentId)
        : (node.children ?? [])
      return childrenExcludingDragged.length + 1
    }

    if (position === 'before') {
      // 현재 노드 앞에 삽입: 드래그 부서 제외한 인덱스 + 1
      return nodeIndexExcludingDragged + 1
    }

    // position === 'after'
    // 현재 노드 뒤에 삽입: 드래그 부서 제외한 인덱스 + 2
    return nodeIndexExcludingDragged + 2
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', `dept:${node.departmentId}`)
    onDepartmentDragStart?.(node)
  }

  const handleDragEnd = () => {
    onDepartmentDragEnd?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!nodeRef.current) return

    const rect = nodeRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    // 드롭 위치 결정 (상단 30%, 중앙 40%, 하단 30%)
    let position: DropPosition

    // 계정 드래그 중일 때는 항상 'child'로만 드롭 가능
    if (isDraggingAccount) {
      position = 'child'
    } else if (y < height * 0.3) {
      position = 'before'
    } else if (y > height * 0.7) {
      position = 'after'
    } else {
      position = 'child'
    }

    onDragOver?.(node.departmentId, position)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDragLeave?.()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!nodeRef.current) return

    const rect = nodeRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    // 드롭 위치 결정 (상단 30%, 중앙 40%, 하단 30%)
    let position: DropPosition

    // 계정 드래그 중일 때는 항상 'child'로만 드롭 가능
    if (isDraggingAccount) {
      position = 'child'
    } else if (y < height * 0.3) {
      position = 'before'
    } else if (y > height * 0.7) {
      position = 'after'
    } else {
      position = 'child'
    }

    const dropInfo: DropInfo = {
      targetId: node.departmentId,
      position,
      parentId: position === 'child' ? node.departmentId : parentId,
      sortOrder: calculateSortOrder(position),
    }

    onDrop?.(dropInfo)
  }

  return (
    <div>
      {/* Before indicator - 계정 드래그 중일 때는 표시하지 않음 */}
      {isDropTarget && dropPosition === 'before' && !isDraggingAccount && (
        <div
          className="h-0.5 bg-primary mx-2 rounded-full"
          style={{ marginLeft: `${level * 20 + 8}px` }}
        />
      )}

      <div
        ref={nodeRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all select-none',
          isSelected
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted/50',
          isDropTarget && dropPosition === 'child' && 'ring-2 ring-primary ring-offset-1 bg-primary/5'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Drag Handle (only for non-root) */}
        {isDraggable ? (
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing p-0.5 -m-0.5 rounded hover:bg-muted/50"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
          </div>
        ) : (
          <div className="w-4" /> // Spacer for alignment
        )}

        {/* Expand/Collapse Button */}
        <button
          className={cn(
            'p-0.5 rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(node.departmentId)
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Department Icon - 자식 유무에 따라 다른 아이콘 */}
        {hasChildren ? (
          <FolderTree className={cn(
            'h-4 w-4 shrink-0',
            isDropTarget && dropPosition === 'child' ? 'text-primary' : 'text-muted-foreground'
          )} />
        ) : (
          <UsersRound className={cn(
            'h-4 w-4 shrink-0',
            isDropTarget && dropPosition === 'child' ? 'text-primary' : 'text-muted-foreground'
          )} />
        )}

        {/* Department Name */}
        <span className="truncate text-sm font-medium">
          {node.departmentName}
        </span>

        {/* Account Count - 부서명 바로 옆에 표시 (해당 부서 직접 인원만) */}
        {node.accountCount > 0 && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({node.accountCount})
          </span>
        )}

        {/* Spacer */}
        <span className="flex-1" />

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateChild(node.departmentId)}>
              <Plus className="h-4 w-4 mr-2" />
              하위 부서 추가
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignAccount(node.departmentId)}>
              <UserPlus className="h-4 w-4 mr-2" />
              계정 배치
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Pencil className="h-4 w-4 mr-2" />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(node)}
              disabled={isRootDepartment}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* After indicator - 계정 드래그 중일 때는 표시하지 않음 */}
      {isDropTarget && dropPosition === 'after' && !isDraggingAccount && (
        <div
          className="h-0.5 bg-primary mx-2 rounded-full"
          style={{ marginLeft: `${level * 20 + 8}px` }}
        />
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.departmentId}
              node={child}
              level={level + 1}
              parentId={node.departmentId}
              siblings={node.children}
              selectedId={selectedId}
              dropTargetId={dropTargetId}
              dropPosition={dropPosition}
              draggedDepartmentId={draggedDepartmentId}
              isDraggingAccount={isDraggingAccount}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onAssignAccount={onAssignAccount}
              onEdit={onEdit}
              onDelete={onDelete}
              onDepartmentDragStart={onDepartmentDragStart}
              onDepartmentDragEnd={onDepartmentDragEnd}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DepartmentTree({
  data,
  selectedId,
  dropTargetId,
  dropPosition,
  draggedDepartmentId,
  isDraggingAccount,
  onSelect,
  onCreateChild,
  onAssignAccount,
  onEdit,
  onDelete,
  onDepartmentDragStart,
  onDepartmentDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: DepartmentTreeProps) {
  // 기본적으로 모든 노드를 펼침
  const getAllIds = (nodes: DepartmentTreeType[]): number[] => {
    return nodes.flatMap((node) => [
      node.departmentId,
      ...getAllIds(node.children || []),
    ])
  }

  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(getAllIds(data))
  )

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FolderTree className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">등록된 부서가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="py-2 px-1">
      {data.map((node) => (
        <TreeNode
          key={node.departmentId}
          node={node}
          level={0}
          parentId={null}
          siblings={data}
          selectedId={selectedId}
          dropTargetId={dropTargetId}
          dropPosition={dropPosition}
          draggedDepartmentId={draggedDepartmentId}
          isDraggingAccount={isDraggingAccount}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
          onSelect={onSelect}
          onCreateChild={onCreateChild}
          onAssignAccount={onAssignAccount}
          onEdit={onEdit}
          onDelete={onDelete}
          onDepartmentDragStart={onDepartmentDragStart}
          onDepartmentDragEnd={onDepartmentDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      ))}
    </div>
  )
}
