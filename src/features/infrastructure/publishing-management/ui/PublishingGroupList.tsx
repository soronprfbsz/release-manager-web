/**
 * Publishing Group List Component
 * 카테고리(제품)별 퍼블리싱 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { Globe, ChevronDown, ChevronRight } from 'lucide-react'

import type { PublishingListItem } from '@/entities/infrastructure/publishing'
import { SortableList } from '@/shared/ui/sortable'

import { getCategoryIcon, getCategoryLabel } from '../lib/publishingHelpers'
import { SortablePublishingCard } from './SortablePublishingCard'

interface PublishingGroupListProps {
  publishings: PublishingListItem[]
  onDelete: (publishing: PublishingListItem) => void
  onEdit?: (publishing: PublishingListItem) => void
  onViewFiles?: (publishing: PublishingListItem) => void
  onReorder?: (category: string, publishingIds: number[]) => void
}

export function PublishingGroupList({
  publishings,
  onDelete,
  onEdit,
  onViewFiles,
  onReorder,
}: PublishingGroupListProps) {
  // 카테고리별 펼침/접힘 상태 (기본: 모두 펼침)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  // Group publishings by publishingCategory
  const groupedPublishings = publishings.reduce(
    (acc, publishing) => {
      const category = publishing.publishingCategory || 'ETC'
      if (!acc[category]) acc[category] = []
      acc[category].push(publishing)
      return acc
    },
    {} as Record<string, PublishingListItem[]>
  )

  // 초기 로드 시 모든 카테고리 펼침
  if (!isInitialized && Object.keys(groupedPublishings).length > 0) {
    setExpandedCategories(new Set(Object.keys(groupedPublishings)))
    setIsInitialized(true)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // 각 그룹별로 독립적인 handleReorder 생성
  const createHandleReorder = (category: string) => (reorderedPublishings: PublishingListItem[]) => {
    if (onReorder) {
      const publishingIds = reorderedPublishings.map((p) => p.publishingId)
      onReorder(category, publishingIds)
    }
  }

  if (publishings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Globe className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 퍼블리싱이 없습니다.</p>
        <p className="text-sm mt-1">+ 버튼을 눌러 새 퍼블리싱을 추가하세요.</p>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(groupedPublishings).map(([category, items]) => {
        return (
          <div
            key={category}
            className="space-y-4 py-8 first:pt-0 last:pb-0 border-t first:border-t-0"
          >
            {/* Group Header with Toggle */}
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border">
                <div className="text-foreground">
                  {getCategoryIcon(category)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{getCategoryLabel(category)}</h3>
                <p className="text-xs text-muted-foreground">{items.length}개의 퍼블리싱</p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Card Grid with Sortable - Collapsible */}
            {expandedCategories.has(category) && (
              <SortableList
                items={items}
                onReorder={createHandleReorder(category)}
                keyExtractor={(publishing) => publishing.publishingId}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                strategy="grid"
                renderItem={(publishing) => (
                  <SortablePublishingCard
                    publishing={publishing}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onViewFiles={onViewFiles}
                  />
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
