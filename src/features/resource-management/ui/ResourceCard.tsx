/**
 * Resource Card Component
 * 리소스 파일 카드 컴포넌트
 */

import { Download, Edit2 } from 'lucide-react'

import type { ResourceFile } from '@/entities/resource'

import { Button } from '@/shared/ui/button'

import { getFileTypeIcon } from '../lib/resourceHelpers'
import { ResourceCardBase } from './ResourceCardBase'

interface ResourceCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  onEdit?: (resource: ResourceFile) => void
  dragHandleProps?: any
  categoryIndex?: number
}

export function ResourceCard({
  resource,
  onDownload,
  onDelete,
  onEdit,
  dragHandleProps,
  categoryIndex = 0,
}: ResourceCardProps) {
  const icon = getFileTypeIcon(resource.fileType)

  return (
    <ResourceCardBase
      title={resource.resourceFileName}
      subtitle={resource.fileName}
      description={resource.description}
      icon={icon}
      categoryIndex={categoryIndex}
      dragHandleProps={dragHandleProps}
      onDelete={() => onDelete(resource)}
      headerActions={
        onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(resource)}
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )
      }
      actionButton={
        <Button className="w-full" onClick={() => onDownload(resource)}>
          <Download className="h-4 w-4 mr-2" />
          다운로드
        </Button>
      }
    />
  )
}
