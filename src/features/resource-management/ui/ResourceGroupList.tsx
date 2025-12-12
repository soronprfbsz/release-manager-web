/**
 * Resource Group List Component
 * 카테고리별 리소스 그룹 목록 컴포넌트
 */

import { FolderOpen } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/code'
import type { ResourceFile } from '@/entities/resource'

import { getGroupIcon } from '../lib/resourceHelpers'
import { ResourceCard } from './ResourceCard'

interface ResourceGroupListProps {
  resources: ResourceFile[]
  categories: CodeSimpleResponse[]
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
}

export function ResourceGroupList({
  resources,
  categories,
  onDownload,
  onDelete,
}: ResourceGroupListProps) {
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
              <div className="p-2 rounded-lg bg-primary/10">
                {getGroupIcon(category)}
              </div>
              <div>
                <h3 className="font-semibold text-base">{getCategoryLabel(category)}</h3>
                <p className="text-xs text-muted-foreground">{files.length}개의 파일</p>
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {files.map((resource) => (
                <ResourceCard
                  key={resource.resourceFileId}
                  resource={resource}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
