/**
 * Link Resource Group List Component
 * 카테고리별 링크 리소스 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'

import type { LinkResource } from '@/entities/infrastructure/resource'
import { linkResourceApi } from '@/entities/infrastructure/resource'
import { SortableList } from '@/shared/ui/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkResourceKeys } from '@/entities/infrastructure/resource'
import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'

import { getGroupIcon } from '../lib/resourceHelpers'
import { SortableLinkResourceCard } from './SortableLinkResourceCard'

interface LinkResourceGroupListProps {
    resources: LinkResource[]
    onDelete: (resource: LinkResource) => void
    onEdit?: (resource: LinkResource) => void
}

export function LinkResourceGroupList({
    resources,
    onDelete,
    onEdit,
}: LinkResourceGroupListProps) {
    const queryClient = useQueryClient()
    // 카테고리별 펼침/접힘 상태 (기본: 모두 펼침)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [isInitialized, setIsInitialized] = useState(false)

    // Fetch category codes to display friendly names
    const { data: categoryList = [] } = useCodesByType(CODE_TYPE.LINK_CATEGORY)

    const getCategoryName = (codeValue: string) => {
        const code = categoryList.find(c => c.value.toLowerCase() === codeValue.toLowerCase())
        return code ? code.name : codeValue
    }

    // Custom mutation for link reordering
    const reorderMutation = useMutation({
        mutationFn: ({ linkCategory, resourceLinkIds }: { linkCategory: string; resourceLinkIds: number[] }) =>
            linkResourceApi.reorder(linkCategory, resourceLinkIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkResourceKeys.lists() })
        },
    })

    // Group resources by linkCategory
    const groupedResources = resources.reduce(
        (acc, resource) => {
            const category = resource.linkCategory || 'ETC'
            if (!acc[category]) acc[category] = []
            acc[category].push(resource)
            return acc
        },
        {} as Record<string, LinkResource[]>
    )

    // 초기 로드 시 모든 카테고리 펼침
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
                <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold">등록된 링크가 없습니다.</p>
                <p className="text-sm">새 링크를 추가하여 관리해보세요.</p>
            </div>
        )
    }

    return (
        <div>
            {Object.entries(groupedResources).map(([category, links]) => {
                // Sort links by sortOrder if available
                const sortedLinks = [...links].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                const categoryName = getCategoryName(category)

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
                                    {getGroupIcon(category)}
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

                        {/* Card Grid with Sortable - Collapsible */}
                        {expandedCategories.has(category) && (
                            <SortableList
                                items={sortedLinks}
                                onReorder={createHandleReorder(category)}
                                keyExtractor={(resource) => resource.resourceLinkId}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                                strategy="grid"
                                renderItem={(resource) => (
                                    <SortableLinkResourceCard
                                        resource={resource}
                                        onDelete={onDelete}
                                        onEdit={onEdit}
                                        categoryIndex={0}
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
