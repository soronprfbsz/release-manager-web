/**
 * Link Resource Tab Widget
 * 링크 리소스 관리 탭 - 링크 CRUD 전체 기능
 */

import { useState, forwardRef, useImperativeHandle } from 'react'

import {
  useLinkResources,
  useCreateLinkResource,
  useUpdateLinkResource,
  useDeleteLinkResource,
  type LinkResource,
  type LinkResourceCreateRequest,
} from '@/entities/infrastructure/resource'

import {
  LinkResourceList,
  LinkResourceForm,
  ResourceFilters,
  type ResourceFiltersState,
} from '@/features/infrastructure/resource-management'

import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

export interface LinkResourceTabHandle {
  openAddDialog: () => void
  refresh: () => void
}

interface LinkResourceTabProps {
  onRefresh?: () => void
}

export const LinkResourceTab = forwardRef<LinkResourceTabHandle, LinkResourceTabProps>(
  function LinkResourceTab({ onRefresh }, ref) {
    const { toast } = useToast()

    // Modal states
    const [isLinkAddOpen, setIsLinkAddOpen] = useState(false)
    const [editingLink, setEditingLink] = useState<LinkResource | null>(null)
    const [deleteLinkTarget, setDeleteLinkTarget] = useState<LinkResource | null>(null)

    // Filter state
    const [filters, setFilters] = useState<ResourceFiltersState>({ keyword: '' })

    // Queries
    const {
      data: linkResources,
      isLoading,
      refetch,
    } = useLinkResources({
      keyword: filters.keyword || undefined,
    })

    // Mutations
    const createLinkMutation = useCreateLinkResource({
      onSuccess: () => {
        toast({ title: '추가 완료', description: '새 링크가 추가되었습니다.' })
        setIsLinkAddOpen(false)
      },
      onError: (error: Error) => {
        toast({ title: '추가 실패', description: error.message, variant: 'destructive' })
      },
    })

    const updateLinkMutation = useUpdateLinkResource({
      onSuccess: () => {
        toast({ title: '수정 완료', description: '링크 정보가 수정되었습니다.' })
        setEditingLink(null)
        setIsLinkAddOpen(false)
      },
      onError: (error: Error) => {
        toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
      },
    })

    const deleteLinkMutation = useDeleteLinkResource({
      onSuccess: () => {
        toast({ title: '삭제 완료', description: '링크가 삭제되었습니다.' })
        setDeleteLinkTarget(null)
      },
      onError: (error: Error) => {
        toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
      },
    })

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      openAddDialog: () => {
        setEditingLink(null)
        setIsLinkAddOpen(true)
      },
      refresh: () => {
        refetch()
        onRefresh?.()
      },
    }))

    // Handlers
    const handleLinkSubmit = (data: LinkResourceCreateRequest) => {
      if (editingLink) {
        updateLinkMutation.mutate({ resourceLinkId: editingLink.resourceLinkId, data })
      } else {
        createLinkMutation.mutate(data)
      }
    }

    const handleEditLink = (resource: LinkResource) => {
      setEditingLink(resource)
      setIsLinkAddOpen(true)
    }

    const linkResourceList = linkResources || []

    return (
      <>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex justify-end">
            <ResourceFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Link List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">링크 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <LinkResourceList
              resources={linkResourceList}
              onDelete={setDeleteLinkTarget}
              onEdit={handleEditLink}
            />
          )}
        </div>

        {/* Link Add/Edit Form (Sheet) */}
        <LinkResourceForm
          isOpen={isLinkAddOpen}
          mode={editingLink ? 'update' : 'create'}
          initialData={editingLink}
          isSubmitting={editingLink ? updateLinkMutation.isPending : createLinkMutation.isPending}
          onSubmit={handleLinkSubmit}
          onClose={() => setIsLinkAddOpen(false)}
        />

        {/* Link Delete Dialog */}
        <AlertDialog
          open={deleteLinkTarget !== null}
          onOpenChange={(open) => !open && setDeleteLinkTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>링크 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 '{deleteLinkTarget?.linkName}' 링크를 삭제하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  if (deleteLinkTarget) deleteLinkMutation.mutate(deleteLinkTarget.resourceLinkId)
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLinkMutation.isPending ? '삭제 중...' : '삭제'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
)
