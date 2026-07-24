/**
 * File Card Component
 * 파일 카드 컴포넌트
 */

import { Download, Pencil, Eye } from 'lucide-react'

import type { ResourceFile } from '@/entities/infrastructure/file'

import { Button } from '@/shared/ui/button'
import { ResourceCard } from '@/shared/ui/resource-card'

import { getFileTypeIcon } from '../lib/fileHelpers'

interface FileCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  onEdit?: (resource: ResourceFile) => void
  onView?: (resource: ResourceFile) => void
  // dnd-kit useSortable 의 attributes+listeners 스프레드 핸들
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any
}

export function FileCard({
  resource,
  onDownload,
  onDelete,
  onEdit,
  onView,
  dragHandleProps,
}: FileCardProps) {
  const icon = getFileTypeIcon(resource.fileType)

  return (
    <ResourceCard
      title={resource.resourceFileName}
      subtitle={resource.fileName}
      subtitleMono
      description={resource.description}
      icon={icon}
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
            <Pencil className="h-4 w-4" />
          </Button>
        )
      }
      actionButton={
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onView(resource)}
            >
              <Eye className="h-4 w-4 mr-2" />
              보기
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onDownload(resource)}
          >
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
        </div>
      }
    />
  )
}

