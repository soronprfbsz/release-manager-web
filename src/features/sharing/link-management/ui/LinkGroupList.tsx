/**
 * Link Group List Component
 * 카테고리별 링크 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as LinkIcon, Plus } from 'lucide-react'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import type { LinkResource } from '@/entities/infrastructure/link'
import { linkResourceApi, linkResourceKeys } from '@/entities/infrastructure/link'

import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import { SortableList } from '@/shared/ui/sortable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { SortableLinkCard } from './SortableLinkCard'
import { getLinkGroupIcon } from '../lib/linkHelpers'

interface LinkGroupListProps {
  resources: LinkResource[]
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
  /** 링크 추가 (카테고리가 선택된 상태로) */
  onAdd?: (category: string) => void
}

export function LinkGroupList({
  resources,
  onDelete,
  onEdit,
  onAdd,
}: LinkGroupListProps) {
  const queryClient = useQueryClient()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.LINK_CATEGORY)

  const getCategoryName = (codeValue: string) => {
    const code = categoryList.find(c => c.value.toLowerCase() === codeValue.toLowerCase())
    return code ? code.name : codeValue
  }

  const reorderMutation = useMutation({
    mutationFn: ({ linkCategory, resourceLinkIds }: { linkCategory: string; resourceLinkIds: number[] }) =>
      linkResourceApi.reorder(linkCategory, resourceLinkIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkResourceKeys.lists() })
    },
  })

  const groupedResources = resources.reduce(
    (acc, resource) => {
      const category = resource.linkCategory || 'ETC'
      if (!acc[category]) acc[category] = []
      acc[category].push(resource)
      return acc
    },
    {} as Record<string, LinkResource[]>
  )

  if (!isInitialized && Object.keys(groupedResources).length > 0) {
    setExpandedCategories(new Set(Object.keys(groupedResources)))
    setIsInitialized(true)
  }

  const createHandleReorder = (category: string) => (reorderedResources: LinkResource[]) => {
    const resourceLinkIds = reorderedResources.map((r) => r.resourceLinkId)
    reorderMutation.mutate({ linkCategory: category, resourceLinkIds })
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
        <LinkIcon className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 링크가 없습니다.</p>
        <p className="text-sm">새 링크를 추가하여 관리해보세요.</p>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(groupedResources).map(([category, links]) => {
        const sortedLinks = [...links].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        const categoryName = getCategoryName(category)
        const IconElement = getLinkGroupIcon(category)

        return (
          <CollapsibleSection
            key={category}
            iconElement={IconElement}
            title={categoryName}
            subtitle={`${links.length}개의 링크`}
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
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAdd(category)
                      }}
                    >
                      <Plus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoryName} 링크 추가</p>
                  </TooltipContent>
                </Tooltip>
              )
            }
            className="mb-14 last:mb-0"
          >
            <SortableList
              items={sortedLinks}
              onReorder={createHandleReorder(category)}
              keyExtractor={(resource) => resource.resourceLinkId}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              strategy="grid"
              renderItem={(resource) => (
                <SortableLinkCard
                  resource={resource}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              )}
            />
          </CollapsibleSection>
        )
      })}
    </div>
  )
}

