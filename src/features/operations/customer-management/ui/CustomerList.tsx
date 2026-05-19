/**
 * Customer List Component
 * 고객사 리스트 — 표준/커스텀 필터 탭 + 평면 리스트
 */

import { ChevronRight, Pencil, Trash2, Search, Loader2 } from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  TreeActionMenu,
  TreeActionMenuItem,
  TreeActionMenuSeparator,
} from '@/shared/ui/tree-action-menu'

import type { CustomerFilter } from '../model/types'

interface CustomerListProps {
  /** 현재 탭·검색이 적용된 표시 목록 (이름 ASC 정렬 완료) */
  customers: Customer[]
  filter: CustomerFilter
  onFilterChange: (filter: CustomerFilter) => void
  /** 표준 고객사 수 (탭 배지) */
  standardCount: number
  /** 커스텀 고객사 수 (탭 배지) */
  customCount: number
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
        'group flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all select-none',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-foreground/20 hover:bg-accent',
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
  onFilterChange,
  standardCount,
  customCount,
  totalCount,
  hasSearch,
  selectedId,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
}: CustomerListProps) {
  return (
    <div className="space-y-3">
      {/* 표준 / 커스텀 필터 탭 */}
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as CustomerFilter)}
      >
        <TabsList className="h-10">
          <TabsTrigger value="standard">
            표준
            <span className="text-xs text-muted-foreground">{standardCount}</span>
          </TabsTrigger>
          <TabsTrigger value="custom">
            커스텀
            <span className="text-xs text-muted-foreground">{customCount}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 리스트 / 상태 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">로딩 중...</span>
        </div>
      ) : totalCount === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-400px)] text-muted-foreground">
          <p className="text-sm">등록된 고객사가 없습니다.</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">
            {hasSearch
              ? '검색 결과가 없습니다.'
              : `${filter === 'standard' ? '표준' : '커스텀'} 고객사가 없습니다.`}
          </p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
