/**
 * Link Card Component
 * 링크 카드 컴포넌트
 */

import { ExternalLink, Pencil } from 'lucide-react'

import type { LinkResource } from '@/entities/infrastructure/link'

import { Button } from '@/shared/ui/button'
import { ResourceCard } from '@/shared/ui/resource-card'

import { getLinkIcon } from '../lib/linkHelpers'

interface LinkCardProps {
  resource: LinkResource
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
  dragHandleProps?: any
}

export function LinkCard({
  resource,
  onDelete,
  onEdit,
  dragHandleProps,
}: LinkCardProps) {
  const icon = getLinkIcon(resource.subCategory)

  return (
    <ResourceCard
      title={resource.linkName}
      subtitle={resource.linkUrl}
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

