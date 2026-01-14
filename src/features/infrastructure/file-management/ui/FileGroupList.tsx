/**
 * File Group List Component
 * 카테고리별 파일 그룹 목록 컴포넌트
 */

import { useState } from 'react'

import { FolderOpen, Plus } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/_shared/code'
import type { ResourceFile } from '@/entities/infrastructure/file'
import { useReorderResources } from '@/entities/infrastructure/file'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import { SortableList } from '@/shared/ui/sortable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { getFileGroupIcon } from '../lib/fileHelpers'
import { SortableFileCard } from './SortableFileCard'

interface FileGroupListProps {
  resources: ResourceFile[]
  categories: CodeSimpleResponse[]
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  onEdit?: (resource: ResourceFile) => void
  onView?: (resource: ResourceFile) => void
  /** 파일 추가 (카테고리가 선택된 상태로) */
  onAdd?: (category: string) => void
}

export function FileGroupList({
  resources,
  categories,
  onDownload,
  onDelete,
  onEdit,
  onView,
  onAdd,
}: FileGroupListProps) {
  const reorderMutation = useReorderResources()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find((c) => c.value === categoryValue)
    return category?.name || categoryValue
  }

  const groupedResources = resources.reduce(
    (acc, resource) => {
      const category = resource.fileCategory || 'ETC'
      if (!acc[category]) acc[category] = []
      acc[category].push(resource)
      return acc
    },
    {} as Record<string, ResourceFile[]>
  )

  if (!isInitialized && Object.keys(groupedResources).length > 0) {
    setExpandedCategories(new Set(Object.keys(groupedResources)))
    setIsInitialized(true)
  }

  const createHandleReorder = (category: string) => (reorderedResources: ResourceFile[]) => {
    const fileIds = reorderedResources.map((r) => r.resourceFileId)
    reorderMutation.mutate({ fileCategory: category, fileIds })
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 파일이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(groupedResources).map(([category, files]) => {
        const categoryLabel = getCategoryLabel(category)
        const IconElement = getFileGroupIcon(category)

        return (
          <CollapsibleSection
            key={category}
            iconElement={IconElement}
            title={categoryLabel}
            subtitle={`${files.length}개의 파일`}
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
                    <p>{categoryLabel} 파일 추가</p>
                  </TooltipContent>
                </Tooltip>
              )
            }
            className="mb-14 last:mb-0"
          >
            <SortableList
              items={files}
              onReorder={createHandleReorder(category)}
              keyExtractor={(resource) => resource.resourceFileId}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              strategy="grid"
              renderItem={(resource) => (
                <SortableFileCard
                  resource={resource}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                />
              )}
            />
          </CollapsibleSection>
        )
      })}
    </div>
  )
}

