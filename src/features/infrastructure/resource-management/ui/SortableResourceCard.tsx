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
  categoryIndex?: number
}

export function SortableResourceCard({
  resource,
  onDownload,
  onDelete,
  onEdit,
  categoryIndex,
}: SortableResourceCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: resource.resourceFileId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <ResourceCard
        resource={resource}
        onDownload={onDownload}
        onDelete={onDelete}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
        categoryIndex={categoryIndex}
      />
    </div>
  )
}
