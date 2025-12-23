/**
 * Sortable Component Card
 * 드래그 가능한 컴포넌트 카드
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import type { ServiceComponent } from '@/entities/service'
import { Button } from '@/shared/ui/button'
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { getComponentTypeIcon, getComponentDisplayInfo, getComponentTypeBackgroundColor } from '../lib/serviceHelpers'

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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: component.componentId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  }

  const Icon = getComponentTypeIcon(component.componentType)
  const displayInfo = getComponentDisplayInfo(component)
  const bgColor = getComponentTypeBackgroundColor(component.componentType)

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`border rounded-lg p-4 space-y-3 transition-colors relative ${bgColor} ${
          !component.isActive ? 'opacity-60' : ''
        }`}
      >
        {!component.isActive && (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted))_10px,hsl(var(--muted))_11px)] rounded-lg pointer-events-none opacity-30" />
        )}
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
