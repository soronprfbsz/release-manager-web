/**
 * Sortable Service Card
 * 드래그 가능한 서비스 카드 컴포넌트
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Service } from '@/entities/service'
import { ServiceCard } from './ServiceCard'

interface SortableServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
  categoryIndex?: number
}

export function SortableServiceCard({
  service,
  onEdit,
  onDelete,
  onManageComponents,
  categoryIndex,
}: SortableServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: service.serviceId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ServiceCard
        service={service}
        onEdit={onEdit}
        onDelete={onDelete}
        onManageComponents={onManageComponents}
        dragHandleProps={{ ...attributes, ...listeners }}
        categoryIndex={categoryIndex}
      />
    </div>
  )
}
