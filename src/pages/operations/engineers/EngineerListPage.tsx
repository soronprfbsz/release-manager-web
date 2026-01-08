/**
 * Engineer List Page
 * 엔지니어 목록 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState, useMemo } from 'react'

import { Plus, Users } from 'lucide-react'

import { usePageIcon } from '@/shared/lib/hooks'

import {
  EngineerTable,
  EngineerForm,
  EngineerFilters,
  EngineerDeleteModal,
  type EngineerFormData,
  type EngineerFiltersState,
  type EngineerFormMode,
  validateEngineerForm,
} from '@/features/operations/engineer-management'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import { useDepartments } from '@/entities/_shared/department'
import {
  useEngineers,
  useCreateEngineer,
  useUpdateEngineer,
  useDeleteEngineer,
  type Engineer,
} from '@/entities/operations'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { DataTableCard } from '@/shared/ui/data-table-card'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'



interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: EngineerFormData = {
  engineerName: '',
  positionCode: '',
  engineerEmail: '',
  departmentId: '',
  description: '',
}

const INITIAL_FILTERS: EngineerFiltersState = {
  keyword: '',
}

export function EngineerListPage() {
  const { icon: pageIcon } = usePageIcon()
  const { toast } = useToast()

  // Filter state
  const [filters, setFilters] = useState<EngineerFiltersState>(INITIAL_FILTERS)

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sort state
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Form state
  const [modalMode, setModalMode] = useState<EngineerFormMode>(null)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [formData, setFormData] = useState<EngineerFormData>(INITIAL_FORM_DATA)

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Computed query params
  const queryParams = useMemo(
    () => ({
      keyword: filters.keyword || undefined,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: sort ? `${sort.key},${sort.direction}` : undefined,
    }),
    [filters, pagination, sort]
  )

  // Queries
  const { data: departments = [] } = useDepartments()
  const { data: positions = [] } = useCodesByType(CODE_TYPE.POSITION)

  const { data: engineerData, isLoading } = useEngineers(queryParams)

  // Mutations
  const createMutation = useCreateEngineer()
  const updateMutation = useUpdateEngineer()
  const deleteMutation = useDeleteEngineer()

  // Handlers
  const openCreateModal = () => {
    setFormData(INITIAL_FORM_DATA)
    setEditingEngineer(null)
    setModalMode('create')
  }

  const openEditModal = (engineer: Engineer) => {
    setFormData({
      engineerName: engineer.engineerName,
      positionCode: engineer.positionCode || '',
      engineerEmail: engineer.engineerEmail,
      departmentId: engineer.departmentId?.toString() || '',
      description: engineer.description || '',
    })
    setEditingEngineer(engineer)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingEngineer(null)
    setFormData(INITIAL_FORM_DATA)
  }

  const handleSubmit = () => {
    const validation = validateEngineerForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    if (modalMode === 'create') {
      createMutation.mutate(
        {
          engineerName: formData.engineerName.trim(),
          positionCode: formData.positionCode.trim() || undefined,
          engineerEmail: formData.engineerEmail.trim(),
          departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
          description: formData.description.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast({ title: '엔지니어 등록 완료', description: '새 엔지니어가 등록되었습니다.' })
            closeModal()
          },
          onError: createErrorHandler(toast, '등록 실패'),
        }
      )
    } else if (modalMode === 'edit' && editingEngineer) {
      updateMutation.mutate(
        {
          id: editingEngineer.engineerId,
          data: {
            engineerName: formData.engineerName.trim(),
            positionCode: formData.positionCode.trim() || undefined,
            engineerEmail: formData.engineerEmail.trim(),
            departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
            description: formData.description.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '엔지니어 정보가 수정되었습니다.' })
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
          toast({ title: '삭제 완료', description: '엔지니어가 삭제되었습니다.' })
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

  const engineerList = engineerData?.content || []

  return (
    <PageLayout
      icon={pageIcon}
      title="엔지니어 관리"
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={openCreateModal} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>엔지니어 등록</p>
          </TooltipContent>
        </Tooltip>
      }
    >
      {/* Engineer List Card */}
      <DataTableCard
        icon={Users}
        title="엔지니어 목록"
        filters={<EngineerFilters filters={filters} onFiltersChange={setFilters} />}
        isLoading={isLoading}
        hasData={engineerList.length > 0}
        totalElements={engineerData?.totalElements || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
      >
        <EngineerTable
          engineers={engineerList}
          sort={sort}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={setDeleteConfirmId}
          viewportHeight="calc(100vh - 27rem)"
        />
      </DataTableCard>

      {/* Form Sheet */}
      <EngineerForm
        mode={modalMode}
        formData={formData}
        departments={departments}
        positions={positions}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Delete Modal */}
      <EngineerDeleteModal
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmId(null)}
      />
    </PageLayout>
  )
}
