/**
 * Service Tab Widget
 * 서비스 관리 탭 - 서비스 및 컴포넌트 CRUD 전체 기능
 */

import { useState, useMemo, forwardRef, useImperativeHandle } from 'react'

import {
  ServiceGroupList,
  ServiceForm,
  ServiceDeleteDialog,
  ComponentForm,
  type ServiceFormData,
  type ComponentFormData,
  type ServiceFormMode,
  type ServiceFiltersState,
  type DeleteTarget,
  validateServiceForm,
} from '@/features/sharing/service-management'

import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useAddComponent,
  useUpdateComponent,
  useDeleteComponent,
  type Service,
  type ServiceCreateRequest,
  type ServiceUpdateRequest,
  type ComponentRequest,
} from '@/entities/infrastructure/service'


import { useToast } from '@/shared/lib/hooks/use-toast'

const INITIAL_SERVICE_FORM: ServiceFormData = {
  serviceName: '',
  serviceType: '',
  description: '',
  glyphText: '',
  glyphBackgroundColor: '',
}

export interface ServiceTabHandle {
  openAddDialog: () => void
  refresh: () => void
}

interface ServiceTabProps {
  filters: ServiceFiltersState
  onRefresh?: () => void
}

export const ServiceTab = forwardRef<ServiceTabHandle, ServiceTabProps>(function ServiceTab(
  { filters, onRefresh },
  ref
) {
  const { toast } = useToast()

  // Service form state
  const [serviceFormMode, setServiceFormMode] = useState<ServiceFormMode>(null)
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>(INITIAL_SERVICE_FORM)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Component management state
  const [managingServiceId, setManagingServiceId] = useState<number | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  // Queries
  const { data: services = [], isLoading, refetch } = useServices({
    serviceType: filters.serviceType !== 'all' ? filters.serviceType : undefined,
    keyword: filters.keyword || undefined,
  })

  // 관리 중인 서비스 (최신 데이터로 자동 갱신)
  const managingService = useMemo(
    () => services.find((s) => s.serviceId === managingServiceId) || null,
    [services, managingServiceId]
  )

  // Mutations
  const createServiceMutation = useCreateService()
  const updateServiceMutation = useUpdateService()
  const deleteServiceMutation = useDeleteService()
  const addComponentMutation = useAddComponent()
  const updateComponentMutation = useUpdateComponent()
  const deleteComponentMutation = useDeleteComponent()

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setServiceFormData(INITIAL_SERVICE_FORM)
      setEditingService(null)
      setServiceFormMode('create')
    },
    refresh: () => {
      refetch()
      onRefresh?.()
    },
  }))

  // Service handlers
  const handleEditService = (service: Service) => {
    setServiceFormData({
      serviceName: service.serviceName,
      serviceType: service.serviceType,
      description: service.description || '',
      glyphText: service.glyphText || '',
      glyphBackgroundColor: service.glyphBackgroundColor || '',
    })
    setEditingService(service)
    setServiceFormMode('edit')
  }

  const handleServiceFormSubmit = () => {
    const validation = validateServiceForm(serviceFormData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    if (serviceFormMode === 'create') {
      const request: ServiceCreateRequest = {
        serviceName: serviceFormData.serviceName,
        serviceType: serviceFormData.serviceType as ServiceCreateRequest['serviceType'],
        description: serviceFormData.description || undefined,
        glyphText: serviceFormData.glyphText || undefined,
        glyphBackgroundColor: serviceFormData.glyphBackgroundColor || undefined,
      }

      createServiceMutation.mutate(request, {
        onSuccess: () => {
          toast({ title: '서비스가 생성되었습니다.' })
          setServiceFormMode(null)
          setServiceFormData(INITIAL_SERVICE_FORM)
        },
        onError: () => {
          toast({ variant: 'destructive', title: '서비스 생성에 실패했습니다.' })
        },
      })
    } else if (serviceFormMode === 'edit' && editingService) {
      const request: ServiceUpdateRequest = {
        serviceName: serviceFormData.serviceName,
        serviceType: serviceFormData.serviceType as ServiceUpdateRequest['serviceType'],
        description: serviceFormData.description || undefined,
        // 빈 문자열 그대로 전송 → 백엔드에서 NULL 로 처리 (글리프 제거)
        glyphText: serviceFormData.glyphText,
        glyphBackgroundColor: serviceFormData.glyphBackgroundColor,
      }

      updateServiceMutation.mutate(
        { id: editingService.serviceId, data: request },
        {
          onSuccess: () => {
            toast({ title: '서비스가 수정되었습니다.' })
            setServiceFormMode(null)
            setServiceFormData(INITIAL_SERVICE_FORM)
            setEditingService(null)
          },
          onError: () => {
            toast({ variant: 'destructive', title: '서비스 수정에 실패했습니다.' })
          },
        }
      )
    }
  }

  const handleServiceFormCancel = () => {
    setServiceFormMode(null)
    setServiceFormData(INITIAL_SERVICE_FORM)
    setEditingService(null)
  }

  const handleDeleteService = (service: Service) => {
    setDeleteTarget({
      type: 'service',
      id: service.serviceId,
      name: service.serviceName,
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === 'service') {
      deleteServiceMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast({ title: '서비스가 삭제되었습니다.' })
          setDeleteTarget(null)
        },
        onError: () => {
          toast({ variant: 'destructive', title: '서비스 삭제에 실패했습니다.' })
        },
      })
    } else if (deleteTarget.type === 'component' && deleteTarget.serviceId) {
      deleteComponentMutation.mutate(
        { serviceId: deleteTarget.serviceId, componentId: deleteTarget.id },
        {
          onSuccess: () => {
            toast({ title: '컴포넌트가 삭제되었습니다.' })
            setDeleteTarget(null)
          },
          onError: () => {
            toast({ variant: 'destructive', title: '컴포넌트 삭제에 실패했습니다.' })
          },
        }
      )
    }
  }

  // Component handlers
  const handleManageComponents = (service: Service) => {
    setManagingServiceId(service.serviceId)
  }

  const handleAddComponent = (formData: ComponentFormData) => {
    if (!managingService) return

    const request: ComponentRequest = {
      componentType: formData.componentType as ComponentRequest['componentType'],
      componentName: formData.componentName,
      host: formData.host || undefined,
      port: formData.port ? Number(formData.port) : undefined,
      url: formData.url || undefined,
      sshPort: formData.sshPort ? Number(formData.sshPort) : undefined,
      description: formData.description || undefined,
    }

    addComponentMutation.mutate(
      { serviceId: managingService.serviceId, data: request },
      {
        onSuccess: () => {
          toast({ title: '컴포넌트가 추가되었습니다.' })
        },
        onError: () => {
          toast({ variant: 'destructive', title: '컴포넌트 추가에 실패했습니다.' })
        },
      }
    )
  }

  const handleUpdateComponent = (componentId: number, formData: ComponentFormData) => {
    if (!managingService) return

    const request: Partial<ComponentRequest> = {
      componentType: formData.componentType as ComponentRequest['componentType'],
      componentName: formData.componentName,
      host: formData.host || undefined,
      port: formData.port ? Number(formData.port) : undefined,
      url: formData.url || undefined,
      sshPort: formData.sshPort ? Number(formData.sshPort) : undefined,
      description: formData.description || undefined,
    }

    updateComponentMutation.mutate(
      { serviceId: managingService.serviceId, componentId, data: request },
      {
        onSuccess: () => {
          toast({ title: '컴포넌트가 수정되었습니다.' })
        },
        onError: () => {
          toast({ variant: 'destructive', title: '컴포넌트 수정에 실패했습니다.' })
        },
      }
    )
  }

  return (
    <>
      <div>
        {/* Service List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <ServiceGroupList
            services={services}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            onManageComponents={handleManageComponents}
            onAdd={(serviceType) => {
              setServiceFormData({
                ...INITIAL_SERVICE_FORM,
                serviceType: serviceType as ServiceFormData['serviceType'],
              })
              setEditingService(null)
              setServiceFormMode('create')
            }}
          />
        )}
      </div>

      {/* Service Form Dialog */}
      <ServiceForm
        mode={serviceFormMode}
        formData={serviceFormData}
        isSubmitting={createServiceMutation.isPending || updateServiceMutation.isPending}
        onFormDataChange={setServiceFormData}
        onSubmit={handleServiceFormSubmit}
        onCancel={handleServiceFormCancel}
      />

      {/* Component Form */}
      <ComponentForm
        service={managingService}
        onClose={() => setManagingServiceId(null)}
        onAddComponent={handleAddComponent}
        onUpdateComponent={handleUpdateComponent}
        onDeleteComponent={setDeleteTarget}
        isSubmitting={addComponentMutation.isPending || updateComponentMutation.isPending}
      />

      {/* Delete Dialog */}
      <ServiceDeleteDialog
        target={deleteTarget}
        isDeleting={deleteServiceMutation.isPending || deleteComponentMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        componentCount={
          deleteTarget?.type === 'service'
            ? services.find((s) => s.serviceId === deleteTarget.id)?.components.length || 0
            : 0
        }
      />
    </>
  )
})
