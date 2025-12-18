/**
 * Customer List Page
 * 고객사 목록 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState, useMemo } from 'react'

import { Building2, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  CustomerTable,
  CustomerForm,
  CustomerFilters,
  CustomerDeleteDialog,
  type CustomerFormData,
  type CustomerFiltersState,
  type CustomerFormMode,
  validateCustomerForm,
} from '@/features/customer-management'

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  type Customer,
} from '@/entities/customer'
import { useProjects } from '@/entities/project'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { PageHeader } from '@/shared/ui/page-header'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'



interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: CustomerFormData = {
  customerCode: '',
  customerName: '',
  description: '',
  isActive: true,
  projectId: '',
}

const INITIAL_FILTERS: CustomerFiltersState = {
  keyword: '',
  isActive: 'all',
}

export function CustomerListPage() {
  const { toast } = useToast()

  // Filter state
  const [filters, setFilters] = useState<CustomerFiltersState>(INITIAL_FILTERS)

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sort state
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Form state
  const [modalMode, setModalMode] = useState<CustomerFormMode>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA)

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Computed query params
  const queryParams = useMemo(() => {
    const isActiveFilter = filters.isActive === 'all' ? undefined : filters.isActive === 'true'
    return {
      isActive: isActiveFilter,
      keyword: filters.keyword || undefined,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: sort ? `${sort.key},${sort.direction}` : undefined,
    }
  }, [filters, pagination, sort])

  // Query
  const { data: customerData, isLoading, refetch } = useCustomers(queryParams)

  // 프로젝트 목록 조회
  const { data: projects = [] } = useProjects()

  // Mutations
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()
  const statusMutation = useUpdateCustomerStatus()

  // Handlers
  const openCreateModal = () => {
    setFormData(INITIAL_FORM_DATA)
    setEditingCustomer(null)
    setModalMode('create')
  }

  const openEditModal = (customer: Customer) => {
    setFormData({
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      description: customer.description || '',
      isActive: customer.isActive,
      projectId: customer.project?.projectId || '',
    })
    setEditingCustomer(customer)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingCustomer(null)
    setFormData(INITIAL_FORM_DATA)
  }

  const handleSubmit = () => {
    const validation = validateCustomerForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    if (modalMode === 'create') {
      createMutation.mutate(
        {
          customerCode: formData.customerCode.trim(),
          customerName: formData.customerName.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          projectId: formData.projectId || undefined,
        },
        {
          onSuccess: () => {
            toast({ title: '고객사 생성 완료', description: '새 고객사가 등록되었습니다.' })
            closeModal()
          },
          onError: createErrorHandler(toast, '생성 실패'),
        }
      )
    } else if (modalMode === 'edit' && editingCustomer) {
      updateMutation.mutate(
        {
          id: editingCustomer.customerId,
          data: {
            customerName: formData.customerName.trim(),
            description: formData.description.trim() || undefined,
            isActive: formData.isActive,
          },
        },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '고객사 정보가 수정되었습니다.' })
            closeModal()
          },
          onError: createErrorHandler(toast, '수정 실패'),
        }
      )
    }
  }

  const handleToggleStatus = (customer: Customer) => {
    statusMutation.mutate(
      { id: customer.customerId, isActive: !customer.isActive },
      {
        onSuccess: () => {
          toast({ title: '상태 변경 완료', description: '활성화 상태가 변경되었습니다.' })
        },
        onError: createErrorHandler(toast, '상태 변경 실패'),
      }
    )
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '고객사가 삭제되었습니다.' })
          setDeleteConfirmId(null)
        },
        onError: createErrorHandler(toast, '삭제 실패'),
      })
    }
  }

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const customerList = customerData?.content || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>운영 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>고객사</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Building2 className="h-5 w-5 text-primary" />}
        title="고객사 관리"
        description="고객사 정보를 등록하고 관리합니다."
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
                <Button onClick={openCreateModal} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>고객사 생성</p>
              </TooltipContent>
            </Tooltip>
          </>
        }
      />

      {/* Customer List Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              고객사 목록
            </CardTitle>
            <CustomerFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <CustomerTable
                customers={customerList}
                sort={sort}
                onSort={handleSort}
                onEdit={openEditModal}
                onDelete={setDeleteConfirmId}
                onToggleStatus={handleToggleStatus}
              />
              {customerList.length > 0 && (
                <div className="pt-4">
                  <DataTablePagination
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    totalElements={customerData?.totalElements || 0}
                    onPaginationChange={setPagination}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Sheet */}
      <CustomerForm
        mode={modalMode}
        formData={formData}
        projects={projects}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Delete Dialog */}
      <CustomerDeleteDialog
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
