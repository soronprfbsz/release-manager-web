/**
 * Resource Card Component
 * 리소스 파일 카드 컴포넌트
 */

import { Download } from 'lucide-react'

import type { ResourceFile } from '@/entities/resource'

import { Button } from '@/shared/ui/button'

import { getSubCategoryIcon } from '../lib/resourceHelpers'
import { ResourceCardBase } from './ResourceCardBase'

interface ResourceCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  dragHandleProps?: any
  categoryIndex?: number
}

export function ResourceCard({
  resource,
  onDownload,
  onDelete,
  dragHandleProps,
  categoryIndex = 0,
}: ResourceCardProps) {
  const icon = getSubCategoryIcon(resource.subCategory)

  return (
    <ResourceCardBase
      title={resource.resourceFileName}
      subtitle={resource.fileName}
      description={resource.description}
      icon={icon}
      categoryIndex={categoryIndex}
      dragHandleProps={dragHandleProps}
      onDelete={() => onDelete(resource)}
      actionButton={
        <Button className="w-full" onClick={() => onDownload(resource)}>
          <Download className="h-4 w-4 mr-2" />
          다운로드
        </Button>
      }
    />
  )
}
