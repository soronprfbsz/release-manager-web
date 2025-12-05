/**
 * Script Download Page (Resource Management)
 * 리소스 관리 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileText, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  ResourceGroupList,
  ResourceUploadForm,
  ResourceDeleteDialog,
  type ResourceUploadFormData,
} from '@/features/resource-management'

import { codeApi, CODE_TYPE } from '@/entities/code'
import { resourceApi, type ResourceFile } from '@/entities/resource'

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
import { PageHeader } from '@/shared/ui/page-header'

const INITIAL_FORM_DATA: ResourceUploadFormData = {
  file: null,
  fileCategory: '',
  subCategory: '',
  description: '',
}

export function ScriptDownloadPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ResourceFile | null>(null)

  // Upload form state
  const [formData, setFormData] = useState<ResourceUploadFormData>(INITIAL_FORM_DATA)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Queries
  const {
    data: resources,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['resources'],
    queryFn: resourceApi.getList,
  })

  const { data: fileCategoryList = [] } = useQuery({
    queryKey: ['codes', CODE_TYPE.RESOURCE_FILE_CATEGORY],
    queryFn: () => codeApi.getCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY),
  })

  // Get subcategory code type based on category
  const getSubCategoryCodeType = (category: string) => {
    switch (category) {
      case 'SCRIPT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
      case 'DOCUMENT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
      default:
        return null
    }
  }

  const subCategoryCodeType = getSubCategoryCodeType(formData.fileCategory)
  const { data: subCategoryList = [] } = useQuery({
    queryKey: ['codes', subCategoryCodeType],
    queryFn: () => codeApi.getCodesByType(subCategoryCodeType!),
    enabled: !!subCategoryCodeType,
  })

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      fileCategory,
      subCategory,
      description,
    }: {
      file: File
      fileCategory: string
      subCategory?: string
      description?: string
    }) =>
      resourceApi.upload(file, fileCategory, subCategory, description, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      }),
    onSuccess: () => {
      toast({ title: '업로드 완료', description: '리소스 파일이 등록되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      closeUploadModal()
    },
    onError: (error: Error) => {
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resourceApi.delete(id),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '리소스 파일이 삭제되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      setDeleteTarget(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    },
  })

  // Handlers
  const handleDownload = (resource: ResourceFile) => {
    resourceApi.download(resource.resourceFileId)
  }

  const openUploadModal = () => {
    setFormData(INITIAL_FORM_DATA)
    setUploadProgress(0)
    setIsUploadOpen(true)
  }

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
    uploadMutation.mutate({
      file: formData.file,
      fileCategory: formData.fileCategory,
      subCategory: formData.subCategory.trim() || undefined,
      description: formData.description.trim() || undefined,
    })
  }

  const resourceList = resources || []

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>리소스 관리</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">리소스 관리</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm mb-4">{(error as Error).message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

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
            <BreadcrumbPage>리소스 관리</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Download className="h-5 w-5 text-primary" />}
        title="리소스 관리"
        description="데이터베이스 백업 및 복원에 필요한 스크립트를 다운로드할 수 있습니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={openUploadModal} variant="outline">
              <Plus className="h-4 w-4" />
              리소스 추가
            </Button>
          </>
        }
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">리소스 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <ResourceGroupList
          resources={resourceList}
          categories={fileCategoryList}
          onDownload={handleDownload}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Upload Form */}
      <ResourceUploadForm
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

      {/* Delete Dialog */}
      <ResourceDeleteDialog
        isOpen={deleteTarget !== null}
        isDeleting={deleteMutation.isPending}
        resourceName={deleteTarget?.description || deleteTarget?.fileName || ''}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.resourceFileId)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
