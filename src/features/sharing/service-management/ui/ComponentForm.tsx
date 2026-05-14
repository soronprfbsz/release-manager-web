/**
 * Component Management Form
 * 컴포넌트 관리 Form
 */

import { useState } from 'react'

import { Plus, Settings } from 'lucide-react'

import type { Service, ServiceComponent } from '@/entities/infrastructure/service'
import { useReorderComponents } from '@/entities/infrastructure/service'

import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { SortableList } from '@/shared/ui/sortable'

import { ComponentModal } from './ComponentModal'
import { SortableComponentCard } from './SortableComponentCard'

import type { ComponentFormData, ComponentFormMode, DeleteTarget } from '../model/types'

interface ComponentFormProps {
  service: Service | null
  onClose: () => void
  onAddComponent: (data: ComponentFormData) => void
  onUpdateComponent: (componentId: number, data: ComponentFormData) => void
  onDeleteComponent: (target: DeleteTarget) => void
  isSubmitting: boolean
}

const INITIAL_COMPONENT_FORM: ComponentFormData = {
  componentType: '',
  componentName: '',
  host: '',
  port: '',
  url: '',
  sshPort: '',
  description: '',
}

export function ComponentForm({
  service,
  onClose,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  isSubmitting,
}: ComponentFormProps) {
  const [formMode, setFormMode] = useState<ComponentFormMode>(null)
  const [formData, setFormData] = useState<ComponentFormData>(INITIAL_COMPONENT_FORM)
  const [editingComponentId, setEditingComponentId] = useState<number | null>(null)

  const reorderMutation = useReorderComponents()
  const components = service?.components || []

  const handleReorder = (reorderedComponents: ServiceComponent[]) => {
    if (!service) return
    const componentIds = reorderedComponents.map((c) => c.componentId)
    reorderMutation.mutate({ serviceId: service.serviceId, componentIds })
  }

  const handleAddClick = () => {
    setFormData(INITIAL_COMPONENT_FORM)
    setEditingComponentId(null)
    setFormMode('create')
  }

  const handleEditClick = (component: ServiceComponent) => {
    setFormData({
      componentType: component.componentType,
      componentName: component.componentName,
      host: component.host || '',
      port: component.port ? String(component.port) : '',
      url: component.url || '',
      sshPort: component.sshPort ? String(component.sshPort) : '',
      description: component.description || '',
    })
    setEditingComponentId(component.componentId)
    setFormMode('edit')
  }

  const handleFormSubmit = () => {
    if (formMode === 'create') {
      onAddComponent(formData)
    } else if (formMode === 'edit' && editingComponentId) {
      onUpdateComponent(editingComponentId, formData)
    }
    setFormMode(null)
  }

  const handleFormCancel = () => {
    setFormMode(null)
    setFormData(INITIAL_COMPONENT_FORM)
    setEditingComponentId(null)
  }

  const handleDeleteClick = (component: ServiceComponent) => {
    if (!service) return
    onDeleteComponent({
      type: 'component',
      id: component.componentId,
      serviceId: service.serviceId,
      name: component.componentName,
    })
  }

  return (
    <>
      <Sheet open={!!service} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
          <SheetHeader className="flex-none">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              컴포넌트 관리
            </SheetTitle>
            <SheetDescription>
              {service?.serviceName}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 min-h-0 mt-6 pr-4">
            <div className="pb-4">
              {/* 컴포넌트 목록 - Sortable */}
              <SortableList
                items={components}
                onReorder={handleReorder}
                keyExtractor={(component) => component.componentId}
                renderItem={(component) => (
                  <SortableComponentCard
                    component={component}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                )}
              />

              {/* 추가 버튼 카드 - 최하단 */}
              <button
                onClick={handleAddClick}
                className="w-full border-2 border-dashed rounded-lg p-4 hover:bg-accent transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 min-h-[156px] mt-3"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">컴포넌트 추가</span>
              </button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ComponentModal
        mode={formMode}
        formData={formData}
        isSubmitting={isSubmitting}
        onFormDataChange={setFormData}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </>
  )
}

