/**
 * Customer List Component
 * 고객사 평면 리스트 (표준/커스텀 필터 탭·검색은 패널 헤더에서 관리)
 */

import { ChevronRight, Pencil, Trash2, Search, Loader2 } from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import {
  TreeActionMenu,
  TreeActionMenuItem,
  TreeActionMenuSeparator,
} from '@/shared/ui/tree-action-menu'

import type { CustomerFilter } from '../model/types'

interface CustomerListProps {
  /** 현재 탭·검색이 적용된 표시 목록 (이름 ASC 정렬 완료) */
  customers: Customer[]
  /** 현재 필터 탭 (빈 상태 메시지용) */
  filter: CustomerFilter
  /** 전체 고객사 수 (빈 상태 분기용) */
  totalCount: number
  /** 검색어 존재 여부 (빈 상태 메시지용) */
  hasSearch: boolean
  selectedId: number | null
  isLoading?: boolean
  onSelect: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

interface CustomerListItemProps {
  customer: Customer
  isSelected: boolean
  onSelect: (customer: Customer) => void
  onEdit?: (customer: Customer) => void
  onDelete?: (customer: Customer) => void
}

function CustomerListItem({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CustomerListItemProps) {
  const { text: glyphText, glyphClass } = resolveGlyph({
    name: customer.customerName,
    glyphText: customer.glyphText,
    glyphBackgroundColor: customer.glyphBackgroundColor,
  })
  const fontSizeClass = getGlyphFontSizeClass(glyphText)
  const version = customer.project?.lastPatchedVersion
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all select-none',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent',
        !customer.isActive && 'opacity-60'
      )}
      onClick={() => onSelect(customer)}
    >
      {/* 글리프 배지 */}
      <div
        className={cn(
          'flex-shrink-0 h-9 w-9 rounded-md flex items-center justify-center',
          'font-mono font-semibold select-none',
          fontSizeClass,
          glyphClass
        )}
      >
        {glyphText}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-sm font-medium">
            {customer.customerName}
          </span>
          {!customer.isActive && (
            <span className="text-[10px] text-orange-500 flex-shrink-0">
              비활성
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {customer.customerCode}
          {version && ` · ${version}`}
        </p>
      </div>

      {/* 우측: chevron ↔ 액션 메뉴 (호버 스왑) */}
      <div className="relative h-7 w-7 flex-shrink-0 flex items-center justify-center">
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted-foreground transition-opacity',
            hasActions && 'group-hover:opacity-0'
          )}
        />
        {hasActions && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'opacity-0 pointer-events-none transition-opacity',
              'group-hover:opacity-100 group-hover:pointer-events-auto'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <TreeActionMenu>
              {onEdit && (
                <TreeActionMenuItem onClick={() => onEdit(customer)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  수정
                </TreeActionMenuItem>
              )}
              {onEdit && onDelete && <TreeActionMenuSeparator />}
              {onDelete && (
                <TreeActionMenuItem destructive onClick={() => onDelete(customer)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </TreeActionMenuItem>
              )}
            </TreeActionMenu>
          </div>
        )}
      </div>
    </div>
  )
}

export function CustomerList({
  customers,
  filter,
  totalCount,
  hasSearch,
  selectedId,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
}: CustomerListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">로딩 중...</span>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-400px)] text-muted-foreground">
        <p className="text-sm">등록된 고객사가 없습니다.</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Search className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">
          {hasSearch
            ? '검색 결과가 없습니다.'
            : `${filter === 'standard' ? '표준' : '커스텀'} 고객사가 없습니다.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {customers.map((customer) => (
        <CustomerListItem
          key={customer.customerId}
          customer={customer}
          isSelected={selectedId === customer.customerId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
