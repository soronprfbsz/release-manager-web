/**
 * Component Management Sheet
 * 컴포넌트 관리 Sheet
 */

import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { Service, ServiceComponent } from '@/entities/service'
import { useReorderComponents } from '@/entities/service'
import { SortableList } from '@/shared/ui/sortable'
import { ComponentForm } from './ComponentForm'
import { SortableComponentCard } from './SortableComponentCard'
import type { ComponentFormData, ComponentFormMode, DeleteTarget } from '../model/types'

interface ComponentSheetProps {
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
  isActive: true,
}

export function ComponentSheet({
  service,
  onClose,
  onAddComponent,
  onUpdateComponent,
  onDeleteComponent,
  isSubmitting,
}: ComponentSheetProps) {
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
      isActive: component.isActive,
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
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              컴포넌트 관리
            </SheetTitle>
            <SheetDescription>
              {service?.serviceName}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
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
                className="w-full border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 min-h-[156px] mt-3"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">컴포넌트 추가</span>
              </button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ComponentForm
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
