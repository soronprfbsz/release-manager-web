/**
 * Engineer List Page
 * 엔지니어 목록 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState, useMemo } from 'react'

import { Users, Plus, RefreshCw } from 'lucide-react'

import {
  EngineerTable,
  EngineerForm,
  EngineerFilters,
  EngineerDeleteDialog,
  type EngineerFormData,
  type EngineerFiltersState,
  type EngineerFormMode,
  validateEngineerForm,
} from '@/features/engineer-management'

import { CODE_TYPE, useCodesByType } from '@/entities/code'
import { useDepartments } from '@/entities/department'
import {
  useEngineers,
  useCreateEngineer,
  useUpdateEngineer,
  useDeleteEngineer,
  type Engineer,
} from '@/entities/engineer'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { PageHeader } from '@/shared/ui/page-header'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'



interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: EngineerFormData = {
  engineerName: '',
  position: '',
  engineerEmail: '',
  departmentId: '',
  description: '',
}

const INITIAL_FILTERS: EngineerFiltersState = {
  keyword: '',
}

export function EngineerListPage() {
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

  const { data: engineerData, isLoading, refetch } = useEngineers(queryParams)

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
      position: engineer.position || '',
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
          position: formData.position.trim() || undefined,
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
            position: formData.position.trim() || undefined,
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Page Header */}
      <PageHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="엔지니어 관리"
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
                <p>엔지니어 등록</p>
              </TooltipContent>
            </Tooltip>
          </>
        }
      />

      {/* Engineer List Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              엔지니어 목록
            </CardTitle>
            <EngineerFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <EngineerTable
                engineers={engineerList}
                sort={sort}
                onSort={handleSort}
                onEdit={openEditModal}
                onDelete={setDeleteConfirmId}
              />
              {engineerList.length > 0 && (
                <div className="pt-4">
                  <DataTablePagination
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    totalElements={engineerData?.totalElements || 0}
                    onPaginationChange={setPagination}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Delete Dialog */}
      <EngineerDeleteDialog
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
