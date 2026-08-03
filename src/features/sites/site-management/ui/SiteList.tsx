/**
 * Site List Component
 * 사이트 구분(고객사 / 내부 테스트)별 그룹 리스트.
 * 표준/커스텀 필터 탭·검색은 패널 헤더에서 관리된다.
 */

import { useState } from 'react'

import { ChevronRight, ChevronDown, Pencil, Trash2, Search, Loader2 } from 'lucide-react'

import type { Site, SiteCategory } from '@/entities/sites/site'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import {
  TreeActionMenu,
  TreeActionMenuItem,
  TreeActionMenuSeparator,
} from '@/shared/ui/tree-action-menu'

import { SITE_CATEGORIES } from '../model/categories'

import type { SiteFilter } from '../model/types'

interface SiteListProps {
  /** 현재 탭·검색이 적용된 표시 목록 (이름 ASC 정렬 완료) */
  sites: Site[]
  /** 현재 필터 탭 (빈 상태 메시지용) */
  filter: SiteFilter
  /** 전체 사이트 수 (빈 상태 분기용) */
  totalCount: number
  /** 검색어 존재 여부 (빈 상태 메시지용) */
  hasSearch: boolean
  selectedId: number | null
  isLoading?: boolean
  onSelect: (site: Site) => void
  onEdit?: (site: Site) => void
  onDelete?: (site: Site) => void
}

interface SiteListItemProps {
  site: Site
  isSelected: boolean
  onSelect: (site: Site) => void
  onEdit?: (site: Site) => void
  onDelete?: (site: Site) => void
}

function SiteListItem({
  site,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: SiteListItemProps) {
  const { text: glyphText, glyphClass } = resolveGlyph({
    name: site.siteName,
    glyphText: site.glyphText,
    glyphBackgroundColor: site.glyphBackgroundColor,
  })
  const fontSizeClass = getGlyphFontSizeClass(glyphText)
  const version = site.project?.lastPatchedVersion
  const hasActions = Boolean(onEdit || onDelete)

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all select-none',
        isSelected ? 'bg-primary/10' : 'hover:bg-accent',
        !site.isActive && 'opacity-60'
      )}
      onClick={() => onSelect(site)}
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
            {site.siteName}
          </span>
          {!site.isActive && (
            <Badge variant="neutral" size="sm" dot className="flex-shrink-0">
              비활성
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {site.siteCode}
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
                <TreeActionMenuItem onClick={() => onEdit(site)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  수정
                </TreeActionMenuItem>
              )}
              {onEdit && onDelete && <TreeActionMenuSeparator />}
              {onDelete && (
                <TreeActionMenuItem destructive onClick={() => onDelete(site)}>
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

interface SiteCategoryGroupProps {
  label: string
  count: number
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
  isEmpty: boolean
}

function SiteCategoryGroup({
  label,
  count,
  collapsed,
  onToggle,
  children,
  isEmpty,
}: SiteCategoryGroupProps) {
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors select-none"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span>{label}</span>
        <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-semibold tabular-nums bg-muted text-muted-foreground">
          {count}
        </span>
      </button>
      {!collapsed &&
        (isEmpty ? (
          <p className="px-3 py-1.5 text-xs text-muted-foreground/70">
            등록된 사이트 없음
          </p>
        ) : (
          <div className="space-y-1.5">{children}</div>
        ))}
    </div>
  )
}

export function SiteList({
  sites,
  filter,
  totalCount,
  hasSearch,
  selectedId,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
}: SiteListProps) {
  // 첫 진입 시 고객사는 펼치고 내부 테스트는 접어둔다.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    INTERNAL_TEST: true,
  })

  const toggle = (category: SiteCategory) =>
    setCollapsed((s) => ({ ...s, [category]: !s[category] }))

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
        <p className="text-sm">등록된 사이트가 없습니다.</p>
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Search className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">
          {hasSearch
            ? '검색 결과가 없습니다.'
            : `${filter === 'standard' ? '표준' : '커스텀'} 사이트가 없습니다.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {SITE_CATEGORIES.map((cat) => {
        const groupSites = sites.filter((s) => s.siteCategory === cat.value)
        // 검색 중이고 해당 그룹에 결과가 있으면 접힘 상태와 무관하게 펼쳐 보여준다.
        const effectiveCollapsed =
          hasSearch && groupSites.length > 0
            ? false
            : Boolean(collapsed[cat.value])
        return (
          <SiteCategoryGroup
            key={cat.value}
            label={cat.label}
            count={groupSites.length}
            collapsed={effectiveCollapsed}
            onToggle={() => toggle(cat.value)}
            isEmpty={groupSites.length === 0}
          >
            {groupSites.map((site) => (
              <SiteListItem
                key={site.siteId}
                site={site}
                isSelected={selectedId === site.siteId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SiteCategoryGroup>
        )
      })}
    </div>
  )
}
