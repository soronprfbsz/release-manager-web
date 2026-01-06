/**
 * Publishing Tab Widget
 * 퍼블리싱 관리 탭 - 퍼블리싱 업로드/수정/삭제/미리보기 전체 기능
 */

import { useState, forwardRef, useImperativeHandle } from 'react'

import {
  usePublishings,
  useUploadPublishing,
  useUpdatePublishing,
  useDeletePublishing,
  useReorderPublishing,
  type PublishingListItem,
  type PublishingUpdateRequest,
} from '@/entities/infrastructure/publishing'

import {
  PublishingGroupList,
  PublishingUploadForm,
  PublishingEditForm,
  PublishingDeleteModal,
  PublishingFilters,
  type PublishingUploadFormData,
  type PublishingFiltersState,
} from '@/features/infrastructure/publishing-management'

import { PublishingFileExplorer } from '@/widgets/infrastructure/publishing-file-explorer'

import { useToast } from '@/shared/lib/hooks/use-toast'

const INITIAL_FORM_DATA: PublishingUploadFormData = {
  file: null,
  publishingName: '',
  publishingCategory: '',
  subCategory: '',
  description: '',
  customerId: null,
}

const INITIAL_FILTERS: PublishingFiltersState = {
  keyword: '',
  publishingCategory: '',
}

export interface PublishingTabHandle {
  openAddDialog: () => void
  refresh: () => void
}

interface PublishingTabProps {
  onRefresh?: () => void
}

export const PublishingTab = forwardRef<PublishingTabHandle, PublishingTabProps>(
  function PublishingTab({ onRefresh }, ref) {
    const { toast } = useToast()

    // Modal states
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [editingPublishing, setEditingPublishing] = useState<PublishingListItem | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<PublishingListItem | null>(null)

    // File explorer state
    const [fileExplorerOpen, setFileExplorerOpen] = useState(false)
    const [selectedPublishing, setSelectedPublishing] = useState<PublishingListItem | null>(null)

    // Upload form state
    const [formData, setFormData] = useState<PublishingUploadFormData>(INITIAL_FORM_DATA)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Filter state
    const [filters, setFilters] = useState<PublishingFiltersState>(INITIAL_FILTERS)

    // Query params 생성
    const queryParams = {
      keyword: filters.keyword || undefined,
      publishingCategory: filters.publishingCategory || undefined,
    }

    // Queries
    const {
      data: publishings,
      isLoading,
      refetch,
    } = usePublishings(queryParams)

    // Mutations
    const uploadMutation = useUploadPublishing({
      onSuccess: () => {
        toast({ title: '업로드 완료', description: '퍼블리싱이 등록되었습니다.' })
        closeUploadModal()
      },
      onError: (error: Error) => {
        toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
      },
    })

    const updateMutation = useUpdatePublishing({
      onSuccess: () => {
        toast({ title: '수정 완료', description: '퍼블리싱 정보가 수정되었습니다.' })
        setEditingPublishing(null)
      },
      onError: (error: Error) => {
        toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
      },
    })

    const deleteMutation = useDeletePublishing({
      onSuccess: () => {
        toast({ title: '삭제 완료', description: '퍼블리싱이 삭제되었습니다.' })
        setDeleteTarget(null)
      },
      onError: (error: Error) => {
        toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
      },
    })

    const reorderMutation = useReorderPublishing({
      onError: (error: Error) => {
        toast({ title: '순서 변경 실패', description: error.message, variant: 'destructive' })
      },
    })

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      openAddDialog: () => {
        setFormData(INITIAL_FORM_DATA)
        setUploadProgress(0)
        setIsUploadOpen(true)
      },
      refresh: () => {
        refetch()
        onRefresh?.()
      },
    }))

    // Handlers
    const closeUploadModal = () => {
      setIsUploadOpen(false)
      setFormData(INITIAL_FORM_DATA)
      setUploadProgress(0)
    }

    const handleUploadSubmit = () => {
      if (!formData.file) {
        toast({
          title: '파일 선택 필요',
          description: '업로드할 ZIP 파일을 선택해주세요.',
          variant: 'destructive',
        })
        return
      }
      if (!formData.publishingCategory) {
        toast({
          title: '카테고리 선택 필요',
          description: '카테고리를 선택해주세요.',
          variant: 'destructive',
        })
        return
      }
      if (!formData.publishingName.trim()) {
        toast({
          title: '퍼블리싱명 입력 필요',
          description: '퍼블리싱명을 입력해주세요.',
          variant: 'destructive',
        })
        return
      }

      uploadMutation.mutate({
        file: formData.file,
        publishingName: formData.publishingName.trim(),
        publishingCategory: formData.publishingCategory,
        subCategory: formData.subCategory || undefined,
        description: formData.description.trim() || undefined,
        customerId: formData.customerId || undefined,
        onProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })
    }

    const handleEditPublishing = (publishing: PublishingListItem) => {
      setEditingPublishing(publishing)
    }

    const handleViewFiles = (publishing: PublishingListItem) => {
      setSelectedPublishing(publishing)
      setFileExplorerOpen(true)
    }

    const handleEditSubmit = (data: PublishingUpdateRequest) => {
      if (editingPublishing) {
        updateMutation.mutate({ id: editingPublishing.publishingId, data })
      }
    }

    const handleReorder = (_category: string, publishingIds: number[]) => {
      reorderMutation.mutate({ publishingIds })
    }

    const publishingList = publishings || []

    return (
      <>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex justify-end">
            <PublishingFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Publishing List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">퍼블리싱 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <PublishingGroupList
              publishings={publishingList}
              onDelete={setDeleteTarget}
              onEdit={handleEditPublishing}
              onViewFiles={handleViewFiles}
              onReorder={handleReorder}
            />
          )}
        </div>

        {/* Publishing Upload Form */}
        <PublishingUploadForm
          isOpen={isUploadOpen}
          formData={formData}
          uploadProgress={uploadProgress}
          isUploading={uploadMutation.isPending}
          onFormDataChange={setFormData}
          onSubmit={handleUploadSubmit}
          onClose={closeUploadModal}
        />

        {/* Publishing Edit Form */}
        <PublishingEditForm
          isOpen={editingPublishing !== null}
          publishing={editingPublishing}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingPublishing(null)}
        />

        {/* Publishing Delete Modal */}
        <PublishingDeleteModal
          isOpen={deleteTarget !== null}
          isDeleting={deleteMutation.isPending}
          publishingName={deleteTarget?.publishingName || ''}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.publishingId)}
          onClose={() => setDeleteTarget(null)}
        />

        {/* Publishing File Explorer */}
        <PublishingFileExplorer
          open={fileExplorerOpen}
          onOpenChange={setFileExplorerOpen}
          publishingId={selectedPublishing?.publishingId ?? null}
          publishingName={selectedPublishing?.publishingName || ''}
        />
      </>
    )
  }
)
