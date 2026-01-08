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
  onDelete: (publishing: PublishingListItem) => void
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'default' as const,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
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
