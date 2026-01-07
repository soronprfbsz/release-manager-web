/**
 * Resource Group List Component
 * 카테고리별 리소스 그룹 목록 컴포넌트
 */

import { FolderOpen } from 'lucide-react'

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
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border">
                <div className="text-foreground">
                  {getGroupIcon(category)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base">{getCategoryLabel(category)}</h3>
                <p className="text-xs text-muted-foreground">{files.length}개의 파일</p>
              </div>
            </div>

            {/* Card Grid with Sortable */}
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
          </div>
        )
      })}
    </div>
  )
}
