/**
 * Sortable Component Card
 * 드래그 가능한 컴포넌트 카드
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import type { ServiceComponent } from '@/entities/service'
import { Button } from '@/shared/ui/button'
import { getComponentTypeIcon, getComponentDisplayInfo, maskPassword } from '../lib/serviceHelpers'

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

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors relative ${
          !component.isActive ? 'bg-muted/30' : ''
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
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{component.componentName}</h4>
            </div>
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

        <div className="space-y-1 text-sm relative z-10">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">접속 정보:</span>
            <span className="break-words flex-1 min-w-0">{displayInfo}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">계정 ID:</span>
            <span className="truncate flex-1 min-w-0">{component.accountId || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">비밀번호:</span>
            <span className="truncate flex-1 min-w-0">{component.password ? maskPassword(component.password) : '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-20 flex-shrink-0">설명:</span>
            <span className="text-muted-foreground break-words flex-1 min-w-0">{component.description || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
