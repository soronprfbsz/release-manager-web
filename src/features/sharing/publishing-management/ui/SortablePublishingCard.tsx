/**
 * Sortable Publishing Card Component
 * 정렬 가능한 퍼블리싱 카드 컴포넌트
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { PublishingListItem } from '@/entities/infrastructure/publishing'

import { PublishingCard } from './PublishingCard'

interface SortablePublishingCardProps {
  publishing: PublishingListItem
  onDelete?: (publishing: PublishingListItem) => void
  onEdit?: (publishing: PublishingListItem) => void
  onViewFiles?: (publishing: PublishingListItem) => void
}

export function SortablePublishingCard({
  publishing,
  onDelete,
  onEdit,
  onViewFiles,
}: SortablePublishingCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: publishing.publishingId })

  const baseTransform = CSS.Transform.toString(transform)
  const scaleTransform = isDragging ? 'scale(1.02)' : ''

  const style: React.CSSProperties = {
    transform: baseTransform ? `${baseTransform} ${scaleTransform}`.trim() : scaleTransform,
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={`h-full ${isDragging ? 'shadow-xl' : ''}`}>
      <PublishingCard
        publishing={publishing}
        onDelete={onDelete}
        onEdit={onEdit}
        onViewFiles={onViewFiles}
        dragHandleProps={listeners}
      />
    </div>
  )
}
