/**
 * Sortable Resource Card
 * 드래그 가능한 리소스 카드 컴포넌트
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ResourceFile } from '@/entities/infrastructure/resource'
import { ResourceCard } from './ResourceCard'

interface SortableResourceCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
  onEdit?: (resource: ResourceFile) => void
  onView?: (resource: ResourceFile) => void
  categoryIndex?: number
}

export function SortableResourceCard({
  resource,
  onDownload,
  onDelete,
  onEdit,
  onView,
  categoryIndex,
}: SortableResourceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: resource.resourceFileId,
  })

  const baseTransform = CSS.Transform.toString(transform)
  const scaleTransform = isDragging ? 'scale(1.02)' : ''
  
  const style: React.CSSProperties = {
    transform: baseTransform ? `${baseTransform} ${scaleTransform}`.trim() : scaleTransform,
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} className={`h-full ${isDragging ? 'shadow-xl' : ''}`}>
      <ResourceCard
        resource={resource}
        onDownload={onDownload}
        onDelete={onDelete}
        onEdit={onEdit}
        onView={onView}
        dragHandleProps={{ ...attributes, ...listeners }}
        categoryIndex={categoryIndex}
      />
    </div>
  )
}
