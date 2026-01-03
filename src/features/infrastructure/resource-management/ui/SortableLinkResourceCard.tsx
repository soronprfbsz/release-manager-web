/**
 * Sortable Link Resource Card
 * 드래그 앤 드롭 정렬이 가능한 링크 리소스 카드
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { LinkResource } from '@/entities/infrastructure/resource'
import { LinkResourceCard } from './LinkResourceCard'

interface SortableLinkResourceCardProps {
    resource: LinkResource
    onDelete: (resource: LinkResource) => void
    onEdit?: (resource: LinkResource) => void
    categoryIndex?: number
}

export function SortableLinkResourceCard({ resource, onDelete, onEdit, categoryIndex }: SortableLinkResourceCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: resource.resourceLinkId,
    })

    // 드래그 중일 때 스타일
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
            <LinkResourceCard
                resource={resource}
                onDelete={onDelete}
                onEdit={onEdit}
                dragHandleProps={{ ...attributes, ...listeners }}
                categoryIndex={categoryIndex}
            />
        </div>
    )
}
