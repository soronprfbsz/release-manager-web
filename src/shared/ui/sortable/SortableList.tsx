/**
 * Sortable List
 * 드래그 앤 드롭으로 순서 변경 가능한 리스트 컴포넌트
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useState } from 'react'

interface SortableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  keyExtractor: (item: T) => string | number
  renderItem: (item: T) => React.ReactNode
  renderOverlay?: (item: T) => React.ReactNode
  disabled?: boolean
  className?: string
  strategy?: 'vertical' | 'grid'
}

export function SortableList<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  renderOverlay,
  disabled = false,
  className = '',
  strategy = 'vertical',
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortingStrategy = strategy === 'grid' ? rectSortingStrategy : verticalListSortingStrategy

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => keyExtractor(item) === active.id)
      const newIndex = items.findIndex((item) => keyExtractor(item) === over.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeItem = activeId ? items.find((item) => keyExtractor(item) === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={strategy === 'vertical' ? [restrictToVerticalAxis] : []}
    >
      <div className={className}>
        <SortableContext
          items={items.map(keyExtractor)}
          strategy={sortingStrategy}
          disabled={disabled}
        >
          {items.map((item) => (
            <div key={keyExtractor(item)} className={strategy === 'vertical' ? 'mb-3 last:mb-0' : ''}>
              {renderItem(item)}
            </div>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="opacity-80">
            {renderOverlay ? renderOverlay(activeItem) : renderItem(activeItem)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
