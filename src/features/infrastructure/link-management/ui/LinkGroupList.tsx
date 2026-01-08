/**
 * Link Group List Component
 * 카테고리별 링크 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { Link as LinkIcon, ChevronDown, ChevronRight } from 'lucide-react'

import type { LinkResource } from '@/entities/infrastructure/link'
import { linkResourceApi, linkResourceKeys } from '@/entities/infrastructure/link'
import { SortableList } from '@/shared/ui/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'

import { getLinkGroupIcon } from '../lib/linkHelpers'
import { SortableLinkCard } from './SortableLinkCard'

interface LinkGroupListProps {
  resources: LinkResource[]
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
}

export function LinkGroupList({
  resources,
  onDelete,
  onEdit,
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

        return (
          <div
            key={category}
            className="space-y-4 py-8 first:pt-0 last:pb-0 border-t first:border-t-0"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border">
                <div className="text-foreground">
                  {getLinkGroupIcon(category)}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{categoryName}</h3>
                <p className="text-xs text-muted-foreground">{links.length}개의 링크</p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                {expandedCategories.has(category) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>

            {expandedCategories.has(category) && (
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
            )}
          </div>
        )
      })}
    </div>
  )
}

