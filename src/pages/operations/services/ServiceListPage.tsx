/**
 * Service List Page
 * 서비스 관리 메인 페이지
 */

import { useState, useMemo } from 'react'
import { Plus, RefreshCw } from 'lucide-react'

import { getPageIconById } from '@/shared/config/menu-icons'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useToast } from '@/shared/lib/hooks/use-toast'
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
} from '@/entities/service'
import {
  ServiceGroupList,
  ServiceForm,
  ServiceDeleteDialog,
  ServiceFilters,
  ComponentSheet,
  type ServiceFormData,
  type ComponentFormData,
  type ServiceFormMode,
  type ServiceFiltersState,
  type DeleteTarget,
  validateServiceForm,
} from '@/features/service-management'

const INITIAL_SERVICE_FORM: ServiceFormData = {
  serviceName: '',
  serviceType: '',
  description: '',
  isActive: true,
}

export function ServiceListPage() {
  const { toast } = useToast()

  // Service form state
  const [serviceFormMode, setServiceFormMode] = useState<ServiceFormMode>(null)
  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>(INITIAL_SERVICE_FORM)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Component management state
  const [managingServiceId, setManagingServiceId] = useState<number | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  // Filter state
  const [filters, setFilters] = useState<ServiceFiltersState>({
    serviceType: 'all',
    keyword: '',
  })

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

  // Service handlers
  const handleAddServiceClick = () => {
    setServiceFormData(INITIAL_SERVICE_FORM)
    setEditingService(null)
    setServiceFormMode('create')
  }

  const handleEditService = (service: Service) => {
    setServiceFormData({
      serviceName: service.serviceName,
      serviceType: service.serviceType,
      description: service.description || '',
      isActive: service.isActive,
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
      }

      createServiceMutation.mutate(request, {
        onSuccess: () => {
          toast({
            title: '서비스가 생성되었습니다.',
          })
          setServiceFormMode(null)
          setServiceFormData(INITIAL_SERVICE_FORM)
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '서비스 생성에 실패했습니다.',
          })
        },
      })
    } else if (serviceFormMode === 'edit' && editingService) {
      const request: ServiceUpdateRequest = {
        serviceName: serviceFormData.serviceName,
        serviceType: serviceFormData.serviceType as ServiceUpdateRequest['serviceType'],
        description: serviceFormData.description || undefined,
        isActive: serviceFormData.isActive,
      }

      updateServiceMutation.mutate(
        { id: editingService.serviceId, data: request },
        {
          onSuccess: () => {
            toast({
              title: '서비스가 수정되었습니다.',
            })
            setServiceFormMode(null)
            setServiceFormData(INITIAL_SERVICE_FORM)
            setEditingService(null)
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: '서비스 수정에 실패했습니다.',
            })
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
          toast({
            title: '서비스가 삭제되었습니다.',
          })
          setDeleteTarget(null)
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '서비스 삭제에 실패했습니다.',
          })
        },
      })
    } else if (deleteTarget.type === 'component' && deleteTarget.serviceId) {
      deleteComponentMutation.mutate(
        { serviceId: deleteTarget.serviceId, componentId: deleteTarget.id },
        {
          onSuccess: () => {
            toast({
              title: '컴포넌트가 삭제되었습니다.',
            })
            setDeleteTarget(null)
          },
          onError: () => {
            toast({
              variant: 'destructive',
              title: '컴포넌트 삭제에 실패했습니다.',
            })
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
      isActive: formData.isActive,
    }

    addComponentMutation.mutate(
      { serviceId: managingService.serviceId, data: request },
      {
        onSuccess: () => {
          toast({
            title: '컴포넌트가 추가되었습니다.',
          })
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '컴포넌트 추가에 실패했습니다.',
          })
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
      isActive: formData.isActive,
    }

    updateComponentMutation.mutate(
      { serviceId: managingService.serviceId, componentId, data: request },
      {
        onSuccess: () => {
          toast({
            title: '컴포넌트가 수정되었습니다.',
          })
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '컴포넌트 수정에 실패했습니다.',
          })
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <DynamicBreadcrumb />

      <div className="space-y-8">
        <PageHeader
          icon={getPageIconById('infrastructure_services')}
          title="인프라 서비스 관리"
          actions={
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => refetch()} variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>새로고침</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAddServiceClick} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>서비스 추가</p>
                </TooltipContent>
              </Tooltip>
            </>
          }
        />

        {/* Filters */}
        <div className="flex justify-end">
          <ServiceFilters filters={filters} onFiltersChange={setFilters} />
        </div>

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
          />
        )}
      </div>

      <ServiceForm
        mode={serviceFormMode}
        formData={serviceFormData}
        isSubmitting={
          createServiceMutation.isPending || updateServiceMutation.isPending
        }
        onFormDataChange={setServiceFormData}
        onSubmit={handleServiceFormSubmit}
        onCancel={handleServiceFormCancel}
      />

      <ComponentSheet
        service={managingService}
        onClose={() => setManagingServiceId(null)}
        onAddComponent={handleAddComponent}
        onUpdateComponent={handleUpdateComponent}
        onDeleteComponent={setDeleteTarget}
        isSubmitting={
          addComponentMutation.isPending ||
          updateComponentMutation.isPending
        }
      />

      <ServiceDeleteDialog
        target={deleteTarget}
        isDeleting={
          deleteServiceMutation.isPending || deleteComponentMutation.isPending
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        componentCount={
          deleteTarget?.type === 'service'
            ? services.find((s) => s.serviceId === deleteTarget.id)?.components.length || 0
            : 0
        }
      />
    </div>
  )
}
