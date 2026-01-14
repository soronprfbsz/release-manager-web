/**
 * Customer List Page
 * 고객사 목록 페이지 - 트리 뷰 + 상세 패널
 */

import { useState, useEffect } from 'react'

import { Plus, Network, Search, X, TableOfContents, Calendar } from 'lucide-react'

import { usePageIcon } from '@/shared/lib/hooks'

import {
  CustomerForm,
  CustomerDeleteModal,
  CustomerTree,
  CustomerDetailPanel,
  type CustomerFormData,
  type CustomerFormMode,
  validateCustomerForm,
} from '@/features/operations/customer-management'

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type Customer,
} from '@/entities/operations'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { formatDateTime } from '@/shared/lib/utils/date'
import { useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { ContentSplit } from '@/shared/ui/content-layout'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const INITIAL_FORM_DATA: CustomerFormData = {
  customerCode: '',
  customerName: '',
  description: '',
  isActive: true,
  projectId: '',
}

export function CustomerListPage() {
  const { icon: pageIcon } = usePageIcon()
  const { toast } = useToast()
  const { projectId } = useProjectStore()

  // Selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)

  // Form state
  const [modalMode, setModalMode] = useState<CustomerFormMode>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_FORM_DATA)

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // 프로젝트 변경 시 선택된 고객사 초기화
  useEffect(() => {
    setSelectedCustomerId(null)
  }, [projectId])

  // Query for customers
  const { data: customersData, isLoading } = useCustomers({
    size: 10000,
    projectId: projectId || undefined,
  })

  // Mutations
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()

  // Derived data
  const customers = customersData?.content || []
  const selectedCustomer = customers.find((c) => c.customerId === selectedCustomerId) || null

  // Handlers
  const openCreateModal = () => {
    setFormData({ ...INITIAL_FORM_DATA, projectId: projectId || '' })
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

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '고객사가 삭제되었습니다.' })
          setDeleteConfirmId(null)
          if (selectedCustomerId === deleteConfirmId) {
            setSelectedCustomerId(null)
          }
        },
        onError: createErrorHandler(toast, '삭제 실패'),
      })
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomerId(customer.customerId)
  }

  return (
    <PageLayout
      icon={pageIcon}
      title="고객사 관리"
      actions={
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
      }
    >
      <ContentSplit>
        {/* Left Panel - Customer Tree */}
        <ContentSplit.Tree
          header={
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-base font-semibold flex-shrink-0">
                <Network className="h-4 w-4" />
                고객사 목록
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="고객사명 또는 코드 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-8 h-7 text-xs"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <CustomerTree
            customers={customers}
            selectedId={selectedCustomerId}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onSelect={handleCustomerSelect}
            onEdit={openEditModal}
            onDelete={(customer) => setDeleteConfirmId(customer.customerId)}
          />
        </ContentSplit.Tree>

        {/* Right Panel - Customer Detail */}
        <ContentSplit.Detail
          isEmpty={!selectedCustomer}
          emptyMessage="고객사를 선택해주세요."
          header={
            selectedCustomer && (
              <div className="flex items-center gap-2 min-w-0 w-full">
                <TableOfContents className="h-4 w-4 flex-shrink-0" />
                <StatusBadge
                  variant={selectedCustomer.isActive ? 'active' : 'inactive'}
                >
                  {selectedCustomer.isActive ? '활성' : '비활성'}
                </StatusBadge>
                {selectedCustomer.description ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h2 className="text-base font-semibold truncate cursor-default">
                        {selectedCustomer.customerName}
                      </h2>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[300px]">{selectedCustomer.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <h2 className="text-base font-semibold truncate">
                    {selectedCustomer.customerName}
                  </h2>
                )}
                <span className="text-muted-foreground text-sm">
                  [{selectedCustomer.customerCode}]
                </span>
                <span className="flex-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-default flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(selectedCustomer.updatedAt || selectedCustomer.createdAt)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>최종 수정일</TooltipContent>
                </Tooltip>
              </div>
            )
          }
        >
          {selectedCustomer && (
            <CustomerDetailPanel customer={selectedCustomer} />
          )}
        </ContentSplit.Detail>
      </ContentSplit>

      {/* Form Sheet */}
      <CustomerForm
        mode={modalMode}
        formData={formData}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Delete Modal */}
      <CustomerDeleteModal
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmId(null)}
      />
    </PageLayout>
  )
}
