/**
 * Sortable Service Card
 * 드래그 가능한 서비스 카드 컴포넌트
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { Service } from '@/entities/infrastructure/service'

import { ServiceCard } from './ServiceCard'

interface SortableServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
}

export function SortableServiceCard({
  service,
  onEdit,
  onDelete,
  onManageComponents,
}: SortableServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.serviceId,
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
    <div ref={setNodeRef} style={style} className={isDragging ? 'shadow-xl' : ''}>
      <ServiceCard
        service={service}
        onEdit={onEdit}
        onDelete={onDelete}
        onManageComponents={onManageComponents}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
