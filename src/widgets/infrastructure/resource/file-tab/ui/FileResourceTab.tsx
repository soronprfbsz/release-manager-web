/**
 * File Resource Tab Widget
 * 파일 리소스 관리 탭 - 파일 업로드/수정/삭제 전체 기능
 */

import { useState, forwardRef, useImperativeHandle, useMemo } from 'react'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import {
  resourceApi,
  useResources,
  useResourceFileContent,
  useUploadResource,
  useUpdateResource,
  useDeleteResource,
  type ResourceFile,
  type ResourceFileUpdateRequest,
} from '@/entities/infrastructure/file'

import {
  FileGroupList,
  FileUploadForm,
  FileEditForm,
  FileDeleteModal,
  FileFilters,
  type FileUploadFormData,
  type FileFiltersState,
} from '@/features/infrastructure/file-management'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { base64ToBlob, base64ToText, isPdfFile, isImageFile, isZipFile } from '@/shared/lib/utils/file-content'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ZipFileExplorer } from '@/shared/ui/zip-file-explorer'

const INITIAL_FORM_DATA: FileUploadFormData = {
  file: null,
  fileCategory: '',
  subCategory: '',
  resourceFileName: '',
  description: '',
}

export interface FileResourceTabHandle {
  openAddDialog: () => void
  refresh: () => void
}

interface FileResourceTabProps {
  onRefresh?: () => void
}

export const FileResourceTab = forwardRef<FileResourceTabHandle, FileResourceTabProps>(
  function FileResourceTab({ onRefresh }, ref) {
    const { toast } = useToast()

    // Modal states
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [editingResource, setEditingResource] = useState<ResourceFile | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ResourceFile | null>(null)
    const [viewingResource, setViewingResource] = useState<ResourceFile | null>(null)

    // Upload form state
    const [formData, setFormData] = useState<FileUploadFormData>(INITIAL_FORM_DATA)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Filter state
    const [filters, setFilters] = useState<FileFiltersState>({ category: '', keyword: '' })

    // Queries
    const {
      data: resources,
      isLoading,
      refetch,
    } = useResources({
      keyword: filters.keyword || undefined,
    })

    const { data: fileCategoryList = [] } = useCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY)

    // Get subcategory code type based on category
    const getSubCategoryCodeType = (category: string) => {
      switch (category) {
        case 'SCRIPT':
          return CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
        case 'DOCUMENT':
          return CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
        default:
          return ''
      }
    }

    const subCategoryCodeType = getSubCategoryCodeType(formData.fileCategory)
    const { data: subCategoryList = [] } = useCodesByType(subCategoryCodeType, {
      enabled: !!subCategoryCodeType,
    })

    // 파일 내용 조회
    const isPdf = viewingResource ? isPdfFile(viewingResource.fileName) : false
    const isImage = viewingResource ? isImageFile(viewingResource.fileName) : false
    const isZip = viewingResource ? isZipFile(viewingResource.fileName) : false
    const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useResourceFileContent(
      viewingResource?.resourceFileId ?? 0,
      viewingResource !== null
    )

    // isBinary가 true면 Base64를 디코딩하여 Blob 또는 텍스트로 변환
    const decodedContent = useMemo(() => {
      if (!fileContentData?.content) return null
      if (fileContentData.isBinary) {
        if (!isPdf && !isImage && !isZip) {
          return base64ToText(fileContentData.content)
        }
        return null
      }
      return fileContentData.content
    }, [fileContentData, isPdf, isImage, isZip])

    const binaryBlob = useMemo(() => {
      if (!fileContentData?.isBinary || !fileContentData?.content) return null
      if (isPdf || isImage || isZip) {
        return base64ToBlob(fileContentData.content, fileContentData.mimeType)
      }
      return null
    }, [fileContentData, isPdf, isImage, isZip])

    // Mutations
    const uploadMutation = useUploadResource({
      onSuccess: () => {
        toast({ title: '업로드 완료', description: '파일이 등록되었습니다.' })
        closeUploadModal()
      },
      onError: (error: Error) => {
        toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
      },
    })

    const updateMutation = useUpdateResource({
      onSuccess: () => {
        toast({ title: '수정 완료', description: '파일 정보가 수정되었습니다.' })
        setEditingResource(null)
      },
      onError: (error: Error) => {
        toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
      },
    })

    const deleteMutation = useDeleteResource({
      onSuccess: () => {
        toast({ title: '삭제 완료', description: '파일이 삭제되었습니다.' })
        setDeleteTarget(null)
      },
      onError: (error: Error) => {
        toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
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
          description: '업로드할 파일을 선택해주세요.',
          variant: 'destructive',
        })
        return
      }
      if (!formData.fileCategory) {
        toast({
          title: '카테고리 선택 필요',
          description: '파일 카테고리를 선택해주세요.',
          variant: 'destructive',
        })
        return
      }
      if (!formData.resourceFileName.trim()) {
        toast({
          title: '파일명 입력 필요',
          description: '파일명을 입력해주세요.',
          variant: 'destructive',
        })
        return
      }
      uploadMutation.mutate({
        file: formData.file,
        fileCategory: formData.fileCategory,
        resourceFileName: formData.resourceFileName.trim(),
        subCategory: formData.subCategory.trim() || undefined,
        description: formData.description.trim() || undefined,
        onProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        },
      })
    }

    const handleDownload = (resource: ResourceFile) => {
      resourceApi.download(resource.resourceFileId)
    }

    const handleViewResource = (resource: ResourceFile) => {
      setViewingResource(resource)
    }

    const handleEditResource = (resource: ResourceFile) => {
      setEditingResource(resource)
    }

    const handleEditResourceSubmit = (data: ResourceFileUpdateRequest) => {
      if (editingResource) {
        updateMutation.mutate({ fileId: editingResource.resourceFileId, data })
      }
    }

    const resourceList = resources || []

    return (
      <>
        <div className="space-y-8">
          {/* Filters */}
          <div className="flex justify-end">
            <FileFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* File List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">파일 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <FileGroupList
              resources={resourceList}
              categories={fileCategoryList}
              onDownload={handleDownload}
              onDelete={setDeleteTarget}
              onEdit={handleEditResource}
              onView={handleViewResource}
            />
          )}
        </div>

        {/* File Upload Form */}
        <FileUploadForm
          isOpen={isUploadOpen}
          formData={formData}
          categories={fileCategoryList}
          subCategories={subCategoryList}
          uploadProgress={uploadProgress}
          isUploading={uploadMutation.isPending}
          onFormDataChange={setFormData}
          onSubmit={handleUploadSubmit}
          onClose={closeUploadModal}
        />

        {/* File Edit Form */}
        <FileEditForm
          isOpen={editingResource !== null}
          resource={editingResource}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleEditResourceSubmit}
          onClose={() => setEditingResource(null)}
        />

        {/* File Delete Modal */}
        <FileDeleteModal
          isOpen={deleteTarget !== null}
          isDeleting={deleteMutation.isPending}
          fileName={deleteTarget?.resourceFileName || deleteTarget?.fileName || ''}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.resourceFileId)}
          onClose={() => setDeleteTarget(null)}
        />

        {/* File Content Viewer - ZIP은 FileExplorer Sheet, 나머지는 Modal */}
        {isZip ? (
          <ZipFileExplorer
            open={viewingResource !== null}
            onOpenChange={(open) => !open && setViewingResource(null)}
            zipBlob={binaryBlob}
            fileName={viewingResource?.fileName || ''}
            icon={DOMAIN_ICONS.file}
            isLoading={isLoadingContent}
            error={contentError as Error | null}
          />
        ) : (
          <FileContentViewerModal
            open={viewingResource !== null}
            onOpenChange={(open) => !open && setViewingResource(null)}
            fileName={viewingResource?.fileName || ''}
            content={decodedContent}
            isLoading={isLoadingContent && !isPdf && !isImage}
            error={!isPdf && !isImage ? (contentError as Error | null) : null}
            onDownload={() => viewingResource && handleDownload(viewingResource)}
            pdfBlob={isPdf ? binaryBlob : null}
            isPdfLoading={isPdf && isLoadingContent}
            pdfError={isPdf ? (contentError as Error | null) : null}
            imageBlob={isImage ? binaryBlob : null}
            isImageLoading={isImage && isLoadingContent}
            imageError={isImage ? (contentError as Error | null) : null}
          />
        )}
      </>
    )
  }
)
