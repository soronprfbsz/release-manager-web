/**
 * Engineer List Page
 * 엔지니어 목록 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

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

import { departmentApi } from '@/entities/department'
import {
  engineerApi,
  type Engineer,
  type EngineerCreateRequest,
  type EngineerUpdateRequest,
} from '@/entities/engineer'

import { useToast } from '@/shared/lib/hooks/use-toast'
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



interface PaginationState {
  pageIndex: number
  pageSize: number
}

const INITIAL_FORM_DATA: EngineerFormData = {
  engineerName: '',
  engineerEmail: '',
  departmentId: '',
  description: '',
}

const INITIAL_FILTERS: EngineerFiltersState = {
  keyword: '',
}

export function EngineerListPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.getList(),
  })

  const { data: engineerData, isLoading, refetch } = useQuery({
    queryKey: ['engineers', filters, pagination, sort],
    queryFn: () => {
      return engineerApi.getList({
        keyword: filters.keyword || undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sort: sort ? `${sort.key},${sort.direction}` : undefined,
      })
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (request: EngineerCreateRequest) => engineerApi.create(request),
    onSuccess: () => {
      toast({ title: '엔지니어 등록 완료', description: '새 엔지니어가 등록되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '등록 실패', description: error.message, variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: EngineerUpdateRequest }) =>
      engineerApi.update(id, request),
    onSuccess: () => {
      toast({ title: '수정 완료', description: '엔지니어 정보가 수정되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => engineerApi.delete(id),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '엔지니어가 삭제되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      setDeleteConfirmId(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    },
  })

  // Handlers
  const openCreateModal = () => {
    setFormData(INITIAL_FORM_DATA)
    setEditingEngineer(null)
    setModalMode('create')
  }

  const openEditModal = (engineer: Engineer) => {
    setFormData({
      engineerName: engineer.engineerName,
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
      createMutation.mutate({
        engineerName: formData.engineerName.trim(),
        engineerEmail: formData.engineerEmail.trim(),
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        description: formData.description.trim() || undefined,
      })
    } else if (modalMode === 'edit' && editingEngineer) {
      updateMutation.mutate({
        id: editingEngineer.engineerId,
        request: {
          engineerName: formData.engineerName.trim(),
          engineerEmail: formData.engineerEmail.trim(),
          departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
          description: formData.description.trim() || undefined,
        },
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
            <BreadcrumbPage>엔지니어</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="엔지니어 관리"
        description="패치 담당 엔지니어 정보를 등록하고 관리합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateModal} variant="outline">
              <Plus className="h-4 w-4" />
              엔지니어 등록
            </Button>
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
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Delete Dialog */}
      <EngineerDeleteDialog
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
