/**
 * File Resource Tab Widget
 * 파일 리소스 관리 탭 - 카테고리별 파일 트리 구조로 관리
 */

import { useState, forwardRef, useImperativeHandle, useMemo } from 'react'

import { Download, Plus, File, FolderPlus, Trash2 } from 'lucide-react'

import {
  useResourceCategories,
  useResourceCategoryFiles,
  useUploadResourceToCategory,
  useDeleteResourceFromCategory,
  useCreateResourceDirectory,
  useCreateResourceCategory,
  useDeleteResourceCategory,
  useFileContent,
  fileApi,
  type ResourceFileNode,
  type ResourceCategoryInfo,
} from '@/entities/infrastructure/file'
import { fileDownloadApi } from '@/shared/api'

import {
  ResourceFileTree,
  ResourceFileUploadSheet,
  ResourceFileDeleteDialog,
  ResourceDirectoryCreateDialog,
  ResourceCategoryCreateDialog,
  ResourceCategoryDeleteDialog,
  getFileGroupIcon,
  type ResourceTreeUploadFormData,
  type ResourceTreeDeleteTarget,
  type ResourceTreeDirectoryCreateTarget,
  type ResourceCategoryDeleteTarget,
  type FileFiltersState,
  INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA,
} from '@/features/sharing/file-management'
import { sortFileTree, type FileSortBy, type FileSortDirection } from '@/shared/lib/utils/file-sort'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'
import { formatFileSize } from '@/shared/lib/utils/format'
import { isViewableFile } from '@/shared/lib/utils/file-icon'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { FileViewer } from '@/shared/ui/file-viewer'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export interface FileResourceTabHandle {
  refresh: () => void
  openCategoryCreate: () => void
}

interface FileResourceTabProps {
  onRefresh?: () => void
  filters?: FileFiltersState
}

// 트리 노드를 키워드로 필터링하는 함수
function filterTreeByKeyword(node: ResourceFileNode, keyword: string): ResourceFileNode | null {
  const lowerKeyword = keyword.toLowerCase()

  // 현재 노드 이름이 키워드를 포함하는지 확인
  const nameMatches = node.name.toLowerCase().includes(lowerKeyword)

  if (node.type === 'file') {
    // 파일인 경우: 이름이 매치되면 반환, 아니면 null
    return nameMatches ? node : null
  }

  // 디렉토리인 경우: 자식들을 재귀적으로 필터링
  const filteredChildren = node.children
    ?.map(child => filterTreeByKeyword(child, keyword))
    .filter((child): child is ResourceFileNode => child !== null)

  // 디렉토리 이름이 매치되거나 필터링된 자식이 있으면 반환
  if (nameMatches || (filteredChildren && filteredChildren.length > 0)) {
    return {
      ...node,
      children: filteredChildren || [],
    }
  }

  return null
}

export const FileResourceTab = forwardRef<FileResourceTabHandle, FileResourceTabProps>(
  function FileResourceTab({ onRefresh, filters }, ref) {
    const { toast } = useToast()
    const { startTransfer, updateProgress, completeTransfer, resetTransfer, transferState } = useFileTransferProgress()

    // 카테고리 목록 조회
    const {
      data: categoriesData,
      isLoading: isLoadingCategories,
      refetch: refetchCategories,
    } = useResourceCategories()

    // 카테고리 배열 추출
    const categories = categoriesData?.categories ?? []

    // 현재 펼쳐진 카테고리들
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    // File viewer state
    const [viewingFile, setViewingFile] = useState<{ filePath: string; name: string; size?: number } | null>(null)

    // Upload state
    const [uploadTarget, setUploadTarget] = useState<{ category: string; categoryName: string; targetPath: string } | null>(null)
    const [uploadFormData, setUploadFormData] = useState<ResourceTreeUploadFormData>(INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA)

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<ResourceTreeDeleteTarget | null>(null)

    // Directory create state
    const [directoryCreateTarget, setDirectoryCreateTarget] = useState<ResourceTreeDirectoryCreateTarget | null>(null)

    // Category create/delete state
    const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false)
    const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<ResourceCategoryDeleteTarget | null>(null)

    // Category mutations
    const createCategoryMutation = useCreateResourceCategory({
      onSuccess: () => {
        toast({ title: '카테고리가 생성되었습니다.' })
        setIsCategoryCreateOpen(false)
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '카테고리 생성 실패',
          description: error.message,
        })
      },
    })

    const deleteCategoryMutation = useDeleteResourceCategory({
      onSuccess: () => {
        toast({ title: '카테고리가 삭제되었습니다.' })
        setCategoryDeleteTarget(null)
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '카테고리 삭제 실패',
          description: error.message,
        })
      },
    })

    // File content viewer hook
    const viewer = useFileContentViewer({
      filePath: viewingFile?.filePath,
      fileName: viewingFile?.name,
      fileSize: viewingFile?.size,
      enabled: viewingFile !== null,
      useContentQuery: useFileContent,
    })

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      refresh: () => {
        refetchCategories()
        onRefresh?.()
      },
      openCategoryCreate: () => {
        setIsCategoryCreateOpen(true)
      },
    }))

    // 카테고리 펼침/접기 토글
    const toggleCategory = (category: string) => {
      setExpandedCategories((prev) => {
        const next = new Set(prev)
        if (next.has(category)) {
          next.delete(category)
        } else {
          next.add(category)
        }
        return next
      })
    }

    // 파일 다운로드
    const handleDownload = (node: ResourceFileNode) => {
      fileDownloadApi.download(node.filePath, node.name)
    }

    // 파일 조회
    const handleFileClick = (node: ResourceFileNode) => {
      if (isViewableFile(node.name)) {
        setViewingFile({ filePath: node.filePath, name: node.name, size: node.size })
      }
    }

    // 선택된 파일 다운로드
    const handleDownloadSelectedFile = () => {
      if (viewingFile) {
        fileDownloadApi.download(viewingFile.filePath, viewingFile.name)
      }
    }

    // 전체 다운로드
    const handleDownloadAll = async (category: string) => {
      if (transferState.isTransferring) return

      const filename = `${category}_files.zip`
      const controller = startTransfer(filename, 'download')

      try {
        await fileApi.downloadCategoryZip(
          category,
          filename,
          (e) => updateProgress(e.loaded, e.total, e.isApproximate),
          controller.signal
        )
        completeTransfer()
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        resetTransfer()
        toast({
          variant: 'destructive',
          title: '다운로드 실패',
          description: error instanceof Error ? error.message : '파일 다운로드 중 오류가 발생했습니다.',
        })
      }
    }

    // 업로드 다이얼로그 열기
    const handleUploadClick = (category: string, categoryName: string, targetPath: string = '/') => {
      // resources/file/{category}/ prefix 제거
      const prefix = `resources/file/${category}/`
      const cleanPath = targetPath.startsWith(prefix)
        ? '/' + targetPath.slice(prefix.length)
        : targetPath

      setUploadTarget({ category, categoryName, targetPath: cleanPath })
      setUploadFormData({ ...INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA, targetPath: cleanPath })
    }

    // 삭제 다이얼로그 열기
    const handleDeleteClick = (category: string, categoryName: string, node: ResourceFileNode) => {
      // resources/file/{category}/ prefix 제거
      const prefix = `resources/file/${category}/`
      const cleanPath = node.filePath.startsWith(prefix)
        ? '/' + node.filePath.slice(prefix.length)
        : node.filePath

      setDeleteTarget({
        name: node.name,
        path: cleanPath,
        type: node.type,
        category,
        categoryName,
      })
    }

    // 디렉토리 생성 다이얼로그 열기
    const handleCreateDirectoryClick = (category: string, categoryName: string, parentPath: string = '/') => {
      // resources/file/{category}/ prefix 제거
      const prefix = `resources/file/${category}/`
      const cleanPath = parentPath.startsWith(prefix)
        ? '/' + parentPath.slice(prefix.length)
        : parentPath

      setDirectoryCreateTarget({ parentPath: cleanPath, category, categoryName })
    }

    return (
      <>
        <div>
          {isLoadingCategories ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">카테고리 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <DOMAIN_ICONS.file className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">등록된 파일이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => (
                <CategorySection
                  key={category.category}
                  category={category}
                  isExpanded={expandedCategories.has(category.category)}
                  onToggle={() => toggleCategory(category.category)}
                  onFileClick={handleFileClick}
                  onDownload={handleDownload}
                  onDownloadAll={() => handleDownloadAll(category.category)}
                  onUpload={(targetPath) => handleUploadClick(category.category, category.category, targetPath)}
                  onDelete={(node) => handleDeleteClick(category.category, category.category, node)}
                  onCreateDirectory={(parentPath) => handleCreateDirectoryClick(category.category, category.category, parentPath)}
                  onDeleteCategory={() => setCategoryDeleteTarget({ category: category.category, fileCount: category.fileCount })}
                  isDownloading={transferState.isTransferring}
                  filterKeyword={filters?.keyword || ''}
                  sortBy={filters?.sortBy || 'name'}
                  sortDirection={filters?.sortDirection || 'asc'}
                />
              ))}
            </div>
          )}
        </div>

        {/* File Content Viewer */}
        <FileViewer
          {...viewer.viewerProps}
          open={viewingFile !== null}
          onOpenChange={(open) => !open && setViewingFile(null)}
          onDownload={handleDownloadSelectedFile}
          canDownload={true}
          zipIcon={DOMAIN_ICONS.file}
        />

        {/* Upload Sheet */}
        {uploadTarget && (
          <ResourceFileUploadSheetWrapper
            category={uploadTarget.category}
            categoryName={uploadTarget.categoryName}
            formData={uploadFormData}
            onFormDataChange={setUploadFormData}
            onClose={() => {
              setUploadTarget(null)
              setUploadFormData(INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA)
            }}
            onSuccess={() => {
              refetchCategories()
              setUploadTarget(null)
              setUploadFormData(INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA)
            }}
          />
        )}

        {/* Delete Dialog */}
        {deleteTarget && (
          <ResourceFileDeleteDialogWrapper
            target={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onSuccess={() => {
              refetchCategories()
              setDeleteTarget(null)
            }}
          />
        )}

        {/* Directory Create Dialog */}
        {directoryCreateTarget && (
          <ResourceDirectoryCreateDialogWrapper
            target={directoryCreateTarget}
            onClose={() => setDirectoryCreateTarget(null)}
            onSuccess={() => {
              refetchCategories()
              setDirectoryCreateTarget(null)
            }}
          />
        )}

        {/* Category Create Dialog */}
        <ResourceCategoryCreateDialog
          isOpen={isCategoryCreateOpen}
          isCreating={createCategoryMutation.isPending}
          onConfirm={(categoryName) => createCategoryMutation.mutate({ categoryName })}
          onCancel={() => setIsCategoryCreateOpen(false)}
        />

        {/* Category Delete Dialog */}
        <ResourceCategoryDeleteDialog
          target={categoryDeleteTarget}
          isDeleting={deleteCategoryMutation.isPending}
          onConfirm={() => categoryDeleteTarget && deleteCategoryMutation.mutate(categoryDeleteTarget.category)}
          onCancel={() => setCategoryDeleteTarget(null)}
        />
      </>
    )
  }
)

// ============================================================================
// Category Section Component
// ============================================================================

interface CategorySectionProps {
  category: ResourceCategoryInfo
  isExpanded: boolean
  onToggle: () => void
  onFileClick: (node: ResourceFileNode) => void
  onDownload: (node: ResourceFileNode) => void
  onDownloadAll: () => void
  onUpload: (targetPath: string) => void
  onDelete: (node: ResourceFileNode) => void
  onCreateDirectory: (parentPath: string) => void
  onDeleteCategory: () => void
  isDownloading: boolean
  filterKeyword: string
  sortBy: FileSortBy
  sortDirection: FileSortDirection
}

function CategorySection({
  category,
  isExpanded,
  onToggle,
  onFileClick,
  onDownload,
  onDownloadAll,
  onUpload,
  onDelete,
  onCreateDirectory,
  onDeleteCategory,
  isDownloading,
  filterKeyword,
  sortBy,
  sortDirection,
}: CategorySectionProps) {
  // 카테고리 파일 트리 조회 (펼쳐졌을 때만)
  const { data: filesData, isLoading: isLoadingFiles } = useResourceCategoryFiles(
    category.category,
    { enabled: isExpanded }
  )

  // 필터링 및 소팅된 파일 트리
  const filteredFiles = useMemo(() => {
    if (!filesData?.files) return undefined

    // 1. 필터링 적용
    let result = filterKeyword.trim()
      ? filterTreeByKeyword(filesData.files, filterKeyword)
      : filesData.files

    // 2. 소팅 적용
    if (result) {
      result = sortFileTree(result, sortBy, sortDirection)
    }

    return result
  }, [filesData?.files, filterKeyword, sortBy, sortDirection])

  return (
    <CollapsibleSection
      variant="boxed-icon"
      iconElement={getFileGroupIcon(category.category)}
      title={category.category}
      subtitle={`${category.fileCount}개 파일 · ${formatFileSize(category.totalSize)}`}
      expanded={isExpanded}
      onExpandedChange={onToggle}
      actions={
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-xs">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpload('/')}>
                <File className="h-4 w-4 mr-2" />
                파일 추가
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateDirectory('/')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                폴더 추가
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {category.fileCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={onDownloadAll}
                  disabled={isDownloading}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>전체 다운로드</TooltipContent>
            </Tooltip>
          )}
          {category.fileCount === 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={onDeleteCategory}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>카테고리 삭제</TooltipContent>
            </Tooltip>
          )}
        </div>
      }
    >
      {isLoadingFiles ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (!filteredFiles?.children || filteredFiles.children.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <DOMAIN_ICONS.file className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">{filterKeyword ? '검색 결과가 없습니다.' : '파일이 없습니다.'}</p>
        </div>
      ) : (
        <ResourceFileTree
          files={filteredFiles}
          onFileClick={onFileClick}
          onDownload={onDownload}
          onUpload={onUpload}
          onDelete={onDelete}
          onCreateDirectory={onCreateDirectory}
          canManageFiles={true}
        />
      )}
    </CollapsibleSection>
  )
}

// ============================================================================
// Wrapper Components for Mutations
// ============================================================================

interface ResourceFileUploadSheetWrapperProps {
  category: string
  categoryName: string
  formData: ResourceTreeUploadFormData
  onFormDataChange: (data: ResourceTreeUploadFormData) => void
  onClose: () => void
  onSuccess: () => void
}

function ResourceFileUploadSheetWrapper({
  category,
  categoryName,
  formData,
  onFormDataChange,
  onClose,
  onSuccess,
}: ResourceFileUploadSheetWrapperProps) {
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const uploadMutation = useUploadResourceToCategory(category)

  const handleSubmit = () => {
    if (!formData.file) return

    setUploadCompleted(false)
    const controller = startTransfer(formData.file.name, 'upload')

    const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
      handleProgress(progressEvent)
      if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !uploadCompleted) {
        setUploadCompleted(true)
        setTimeout(() => startServerProcessing(), 100)
      }
    }

    uploadMutation.mutate(
      {
        file: formData.file,
        targetPath: formData.targetPath,
        extractZip: formData.extractZip,
        onUploadProgress: progressHandler,
        signal: controller.signal,
      },
      {
        onSuccess: () => {
          completeTransfer()
          toast({ title: '파일이 업로드되었습니다.' })
          onSuccess()
        },
        onError: (error) => {
          // 취소된 경우 에러 토스트 표시하지 않음
          if (error.name === 'CanceledError' || error.message === 'canceled') {
            return
          }
          resetTransfer()
          toast({
            variant: 'destructive',
            title: '업로드 실패',
            description: error.message,
          })
        },
      }
    )
  }

  return (
    <ResourceFileUploadSheet
      isOpen={true}
      categoryName={categoryName}
      formData={formData}
      isUploading={uploadMutation.isPending}
      onFormDataChange={onFormDataChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  )
}

interface ResourceFileDeleteDialogWrapperProps {
  target: ResourceTreeDeleteTarget
  onClose: () => void
  onSuccess: () => void
}

function ResourceFileDeleteDialogWrapper({
  target,
  onClose,
  onSuccess,
}: ResourceFileDeleteDialogWrapperProps) {
  const { toast } = useToast()
  const deleteMutation = useDeleteResourceFromCategory(target.category)

  const handleConfirm = () => {
    deleteMutation.mutate(target.path, {
      onSuccess: () => {
        toast({ title: `${target.type === 'directory' ? '폴더' : '파일'}가 삭제되었습니다.` })
        onSuccess()
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '삭제 실패',
          description: error.message,
        })
      },
    })
  }

  return (
    <ResourceFileDeleteDialog
      target={target}
      isDeleting={deleteMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}

interface ResourceDirectoryCreateDialogWrapperProps {
  target: ResourceTreeDirectoryCreateTarget
  onClose: () => void
  onSuccess: () => void
}

function ResourceDirectoryCreateDialogWrapper({
  target,
  onClose,
  onSuccess,
}: ResourceDirectoryCreateDialogWrapperProps) {
  const { toast } = useToast()
  const createMutation = useCreateResourceDirectory(target.category)

  const handleConfirm = (directoryName: string) => {
    const fullPath = target.parentPath === '/'
      ? `/${directoryName}`
      : `${target.parentPath}/${directoryName}`

    createMutation.mutate(fullPath, {
      onSuccess: () => {
        toast({ title: '폴더가 생성되었습니다.' })
        onSuccess()
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '폴더 생성 실패',
          description: error.message,
        })
      },
    })
  }

  return (
    <ResourceDirectoryCreateDialog
      target={target}
      isCreating={createMutation.isPending}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  )
}
