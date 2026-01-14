/**
 * Publishing Group List Component
 * 카테고리(제품)별 퍼블리싱 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { Globe, Plus } from 'lucide-react'

import type { PublishingListItem } from '@/entities/infrastructure/publishing'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import { SortableList } from '@/shared/ui/sortable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { getCategoryIcon, getCategoryLabel } from '../lib/publishingHelpers'
import { SortablePublishingCard } from './SortablePublishingCard'

interface PublishingGroupListProps {
  publishings: PublishingListItem[]
  onDelete: (publishing: PublishingListItem) => void
  onEdit?: (publishing: PublishingListItem) => void
  onViewFiles?: (publishing: PublishingListItem) => void
  onReorder?: (category: string, publishingIds: number[]) => void
  /** 퍼블리싱 추가 (카테고리가 선택된 상태로) */
  onAdd?: (category: string) => void
}

export function PublishingGroupList({
  publishings,
  onDelete,
  onEdit,
  onViewFiles,
  onReorder,
  onAdd,
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
        const categoryLabel = getCategoryLabel(category)
        const IconElement = getCategoryIcon(category)

        return (
          <CollapsibleSection
            key={category}
            iconElement={IconElement}
            title={categoryLabel}
            subtitle={`${items.length}개의 퍼블리싱`}
            variant="boxed-icon"
            expanded={expandedCategories.has(category)}
            onExpandedChange={(expanded) => {
              setExpandedCategories(prev => {
                const next = new Set(prev)
                if (expanded) {
                  next.add(category)
                } else {
                  next.delete(category)
                }
                return next
              })
            }}
            actions={
              onAdd && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAdd(category)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoryLabel} 퍼블리싱 추가</p>
                  </TooltipContent>
                </Tooltip>
              )
            }
            className="mb-14 last:mb-0"
          >
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
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
