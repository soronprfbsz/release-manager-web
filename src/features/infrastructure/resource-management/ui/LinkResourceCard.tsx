/**
 * Link Resource Card Component
 * 링크 리소스 카드 컴포넌트
 */

import { ExternalLink, Edit2 } from 'lucide-react'

import type { LinkResource } from '@/entities/infrastructure/resource'

import { Button } from '@/shared/ui/button'

import { getSubCategoryIcon } from '../lib/resourceHelpers'
import { ResourceCardBase } from './ResourceCardBase'

interface LinkResourceCardProps {
  resource: LinkResource
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
  dragHandleProps?: any
  categoryIndex?: number
}

export function LinkResourceCard({
  resource,
  onDelete,
  onEdit,
  dragHandleProps,
  categoryIndex = 0,
}: LinkResourceCardProps) {
  const icon = getSubCategoryIcon(resource.subCategory)

  return (
    <ResourceCardBase
      title={resource.linkName}
      subtitle={resource.linkUrl}
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
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(resource.linkUrl, '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          열기
        </Button>
      }
    />
  )
}
