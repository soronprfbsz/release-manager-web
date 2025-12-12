/**
 * Component Management Sheet
 * 컴포넌트 관리 Sheet
 */

import { useState } from 'react'
import { Plus, Pencil, Trash2, Settings } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { Service, ServiceComponent } from '@/entities/service'
import { getComponentTypeIcon, getComponentDisplayInfo, maskPassword } from '../lib/serviceHelpers'
import { ComponentForm } from './ComponentForm'
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
  accountId: '',
  password: '',
  sshPort: '',
  sshAccountId: '',
  sshPassword: '',
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

  const components = service?.components || []

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
      accountId: component.accountId || '',
      password: '',
      sshPort: component.sshPort ? String(component.sshPort) : '',
      sshAccountId: component.sshAccountId || '',
      sshPassword: '',
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
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              컴포넌트 관리
            </SheetTitle>
            <SheetDescription>
              {service?.serviceName}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-160px)] mt-6 pr-4">
            <div className="space-y-3">
              {/* 컴포넌트 목록 */}
              {components.map((component) => {
                    const Icon = getComponentTypeIcon(component.componentType)
                    const displayInfo = getComponentDisplayInfo(component)

                    return (
                      <div
                        key={component.componentId}
                        className={`border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors relative ${
                          !component.isActive ? 'bg-muted/30' : ''
                        }`}
                      >
                        {!component.isActive && (
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted))_10px,hsl(var(--muted))_11px)] rounded-lg pointer-events-none opacity-30" />
                        )}
                        <div className="flex items-start justify-between gap-2 relative z-10">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {component.componentName}
                              </h4>
                            </div>
                          </div>
                          <div className="flex gap-0 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(component)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(component)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1 text-sm relative z-10">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-20 flex-shrink-0">
                              접속 정보:
                            </span>
                            <span className="break-all">{displayInfo}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-20 flex-shrink-0">
                              계정 ID:
                            </span>
                            <span>{component.accountId || '-'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-20 flex-shrink-0">
                              비밀번호:
                            </span>
                            <span>{component.password ? maskPassword(component.password) : '-'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground w-20 flex-shrink-0">
                              설명:
                            </span>
                            <span className="text-muted-foreground">
                              {component.description || '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

              {/* 추가 버튼 카드 - 최하단 */}
              <button
                onClick={handleAddClick}
                className="w-full border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 min-h-[156px]"
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
