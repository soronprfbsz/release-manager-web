/**
 * Resource Group List Component
 * 카테고리별 리소스 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/_shared/code'
import type { ResourceFile } from '@/entities/infrastructure/resource'
import { useReorderResources } from '@/entities/infrastructure/resource'
import { SortableList } from '@/shared/ui/sortable'

import { getGroupIcon } from '../lib/resourceHelpers'
import { SortableResourceCard } from './SortableResourceCard'

interface ResourceGroupListProps {
  resources: ResourceFile[]
  categories: CodeSimpleResponse[]
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  onEdit?: (resource: ResourceFile) => void
  onView?: (resource: ResourceFile) => void
}

export function ResourceGroupList({
  resources,
  categories,
  onDownload,
  onDelete,
  onEdit,
  onView,
}: ResourceGroupListProps) {
  const reorderMutation = useReorderResources()
  // 카테고리별 펼침/접힘 상태 (기본: 모두 펼침)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find((c) => c.value === categoryValue)
    return category?.name || categoryValue
  }

  // Group resources by fileCategory
  const groupedResources = resources.reduce(
    (acc, resource) => {
      const category = resource.fileCategory || 'ETC'
      if (!acc[category]) acc[category] = []
      acc[category].push(resource)
      return acc
    },
    {} as Record<string, ResourceFile[]>
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

  // 각 그룹별로 독립적인 handleReorder 생성
  const createHandleReorder = (category: string) => (reorderedResources: ResourceFile[]) => {
    // 재정렬된 리소스들의 ID 목록
    const resourceFileIds = reorderedResources.map((r) => r.resourceFileId)

    // fileCategory와 함께 전달
    reorderMutation.mutate({ fileCategory: category, resourceFileIds })
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 리소스가 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(groupedResources).map(([category, files]) => {
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
                <h3 className="font-semibold text-base">{getCategoryLabel(category)}</h3>
                <p className="text-xs text-muted-foreground">{files.length}개의 파일</p>
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
                items={files}
                onReorder={createHandleReorder(category)}
                keyExtractor={(resource) => resource.resourceFileId}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                strategy="grid"
                renderItem={(resource) => (
                  <SortableResourceCard
                    resource={resource}
                    onDownload={onDownload}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onView={onView}
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
