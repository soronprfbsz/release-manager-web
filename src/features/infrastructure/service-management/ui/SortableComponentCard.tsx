/**
 * Sortable Component Card
 * 드래그 가능한 컴포넌트 카드
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import type { ServiceComponent } from '@/entities/infrastructure/service'
import { Button } from '@/shared/ui/button'
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { getComponentTypeIcon, getComponentDisplayInfo } from '../lib/serviceHelpers'

interface SortableComponentCardProps {
  component: ServiceComponent
  onEdit: (component: ServiceComponent) => void
  onDelete: (component: ServiceComponent) => void
}

export function SortableComponentCard({
  component,
  onEdit,
  onDelete,
}: SortableComponentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.componentId,
  })

  const baseTransform = CSS.Transform.toString(transform)
  const scaleTransform = isDragging ? 'scale(1.02)' : ''
  
  const style: React.CSSProperties = {
    transform: baseTransform ? `${baseTransform} ${scaleTransform}`.trim() : scaleTransform,
    transition: transition ?? 'transform 250ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  const Icon = getComponentTypeIcon(component.componentType)
  const displayInfo = getComponentDisplayInfo(component)

  return (
    <div ref={setNodeRef} style={style} className="mb-3 last:mb-0">
      <div
        className="border rounded-lg p-4 space-y-3 transition-all duration-200 relative bg-accent/40 shadow-sm hover:shadow-md hover:border-primary/50"
      >
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 드래그 핸들 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-grab active:cursor-grabbing flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <TruncatedCell
              tooltipText={component.componentName}
              maxLines={1}
              className="flex-1 min-w-0 font-medium"
            >
              {component.componentName}
            </TruncatedCell>
          </div>
          <div className="flex gap-0 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(component)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(component)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm relative z-10 space-y-3">
          <div className="space-y-1">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-20 flex-shrink-0">접속 정보:</span>
              <TruncatedCell
                tooltipText={displayInfo}
                maxLines={1}
                className="flex-1 min-w-0"
              >
                {displayInfo}
              </TruncatedCell>
            </div>

            {component.sshPort && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 flex-shrink-0">SSH Port:</span>
                <span className="truncate flex-1 min-w-0">{component.sshPort}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">설명:</span>
            <TruncatedCell
              tooltipText={component.description || ''}
              maxLines={2}
              className="text-muted-foreground flex-1 min-w-0"
            >
              {component.description || '-'}
            </TruncatedCell>
          </div>
        </div>
      </div>
    </div>
  )
}
