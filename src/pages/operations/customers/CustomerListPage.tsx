/**
 * Customer List Page
 * 고객사 목록 페이지 - 리스트 뷰 + 상세 패널
 */

import { useState, useEffect, useMemo } from 'react'

import { Plus, Network, Search, X } from 'lucide-react'

import {
  CustomerForm,
  CustomerDeleteModal,
  CustomerList,
  CustomerDetailPanel,
  type CustomerFormData,
  type CustomerFormMode,
  type CustomerFilter,
  validateCustomerForm,
} from '@/features/operations/customer-management'

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type Customer,
} from '@/entities/operations'

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { ContentSplit } from '@/shared/ui/content-layout'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const INITIAL_FORM_DATA: CustomerFormData = {
  customerCode: '',
  customerName: '',
  description: '',
  isActive: true,
  projectId: '',
  glyphText: '',
  glyphBackgroundColor: '',
}

export function CustomerListPage() {
  const { toast } = useToast()
  const { canCreateCustomer, canEditCustomer, canDeleteCustomer } = usePermission()
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

  // Filter tab state (표준 / 커스텀)
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('standard')

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
  const customers = useMemo(() => customersData?.content || [], [customersData])
  const selectedCustomer = customers.find((c) => c.customerId === selectedCustomerId) || null

  // 이름 ASC 정렬 후 표준/커스텀 분류
  const { standardCustomers, customCustomers } = useMemo(() => {
    const sorted = [...customers].sort((a, b) =>
      a.customerName.localeCompare(b.customerName)
    )
    return {
      standardCustomers: sorted.filter((c) => !c.hasCustomVersion),
      customCustomers: sorted.filter((c) => c.hasCustomVersion),
    }
  }, [customers])

  // 현재 탭 + 검색어가 적용된 표시 목록
  const displayedCustomers = useMemo(() => {
    const base = customerFilter === 'standard' ? standardCustomers : customCustomers
    const term = searchTerm.trim().toLowerCase()
    if (!term) return base
    return base.filter(
      (c) =>
        c.customerName.toLowerCase().includes(term) ||
        c.customerCode.toLowerCase().includes(term)
    )
  }, [customerFilter, standardCustomers, customCustomers, searchTerm])

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
      glyphText: customer.glyphText || '',
      glyphBackgroundColor: customer.glyphBackgroundColor || '',
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
          glyphText: formData.glyphText,
          glyphBackgroundColor: formData.glyphBackgroundColor,
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
            glyphText: formData.glyphText,
            glyphBackgroundColor: formData.glyphBackgroundColor,
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
      fullHeight
      actions={
        canCreateCustomer ? (
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
        ) : null
      }
    >
      <ContentSplit treeWidth={25}>
        {/* Left Panel - Customer List */}
        <ContentSplit.Tree
          header={
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-base font-semibold flex-shrink-0">
                <Network className="h-4 w-4" />
                고객사 목록
              </div>
              <span className="text-xs font-normal text-muted-foreground flex-shrink-0">
                {displayedCustomers.length}/{customers.length}
              </span>
              <span className="flex-1" />
              <div className="relative w-58">
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
          <CustomerList
            customers={displayedCustomers}
            filter={customerFilter}
            onFilterChange={setCustomerFilter}
            standardCount={standardCustomers.length}
            customCount={customCustomers.length}
            totalCount={customers.length}
            hasSearch={Boolean(searchTerm.trim())}
            selectedId={selectedCustomerId}
            isLoading={isLoading}
            onSelect={handleCustomerSelect}
            onEdit={canEditCustomer ? openEditModal : undefined}
            onDelete={canDeleteCustomer ? (customer) => setDeleteConfirmId(customer.customerId) : undefined}
          />
        </ContentSplit.Tree>

        {/* Right Panel - Customer Detail (헤더는 패널 내부에서 Hero+Meta Rail 형태로) */}
        <ContentSplit.Detail
          isEmpty={!selectedCustomer}
          emptyMessage="고객사를 선택해주세요."
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
        editingCustomer={editingCustomer}
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
