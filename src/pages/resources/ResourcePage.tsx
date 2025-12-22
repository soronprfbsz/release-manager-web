/**
 * Resource Page
 * 리소스 관리 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { Download, FileText, Plus, RefreshCw, Link as LinkIcon, FolderOpen } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  ResourceGroupList,
  ResourceUploadForm,
  ResourceEditForm,
  ResourceDeleteDialog,
  LinkResourceList,
  LinkResourceForm,
  type ResourceUploadFormData,
} from '@/features/resource-management'

import { CODE_TYPE, useCodesByType } from '@/entities/code'
import {
  resourceApi,
  useResources,
  useUploadResource,
  useUpdateResource,
  useDeleteResource,
  useLinkResources,
  useCreateLinkResource,
  useUpdateLinkResource,
  useDeleteLinkResource,
  type ResourceFile,
  type ResourceFileUpdateRequest,
  type LinkResource,
  type LinkResourceCreateRequest,
} from '@/entities/resource'

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"

const INITIAL_FORM_DATA: ResourceUploadFormData = {
  file: null,
  fileCategory: '',
  subCategory: '',
  resourceFileName: '',
  description: '',
}

type TabType = 'files' | 'links'

export function ResourcePage() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = (searchParams.get('tab') as TabType) || 'files'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // ==================================================================================
  // File Resource States & Logic
  // ==================================================================================

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<ResourceFile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ResourceFile | null>(null)

  // Upload form state
  const [formData, setFormData] = useState<ResourceUploadFormData>(INITIAL_FORM_DATA)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Queries
  const {
    data: resources,
    isLoading: isResourcesLoading,
    error: resourcesError,
    refetch: refetchResources,
  } = useResources({
    enabled: currentTab === 'files'
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

  // Mutations
  const uploadMutation = useUploadResource({
    onSuccess: () => {
      toast({ title: '업로드 완료', description: '리소스 파일이 등록되었습니다.' })
      closeUploadModal()
    },
    onError: (error: Error) => {
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
    },
  })

  const updateMutation = useUpdateResource({
    onSuccess: () => {
      toast({ title: '수정 완료', description: '리소스 파일 정보가 수정되었습니다.' })
      setEditingResource(null)
    },
    onError: (error: Error) => {
      toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useDeleteResource({
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '리소스 파일이 삭제되었습니다.' })
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

  const handleEditResource = (resource: ResourceFile) => {
    setEditingResource(resource)
  }

  const handleEditResourceSubmit = (data: ResourceFileUpdateRequest) => {
    if (editingResource) {
      updateMutation.mutate({ resourceFileId: editingResource.resourceFileId, data })
    }
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
    if (!formData.resourceFileName.trim()) {
      toast({
        title: '리소스명 입력 필요',
        description: '리소스명을 입력해주세요.',
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

  const resourceList = resources || []

  // ==================================================================================
  // Link Resource States & Logic
  // ==================================================================================

  const [isLinkAddOpen, setIsLinkAddOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkResource | null>(null)
  const [deleteLinkTarget, setDeleteLinkTarget] = useState<LinkResource | null>(null)

  const {
    data: linkResources,
    isLoading: isLinksLoading,
    error: linksError,
    refetch: refetchLinks,
  } = useLinkResources({
    enabled: currentTab === 'links'
  })

  const createLinkMutation = useCreateLinkResource({
    onSuccess: () => {
      toast({ title: '추가 완료', description: '새 링크가 추가되었습니다.' })
      setIsLinkAddOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: '추가 실패', description: error.message, variant: 'destructive' })
    }
  })

  // We need to import useUpdateLinkResource
  const updateLinkMutation = useUpdateLinkResource({
    onSuccess: () => {
      toast({ title: '수정 완료', description: '링크 정보가 수정되었습니다.' })
      setEditingLink(null)
      setIsLinkAddOpen(false)
    },
    onError: (error: Error) => {
      toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
    }
  })

  const deleteLinkMutation = useDeleteLinkResource({
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '링크가 삭제되었습니다.' })
      setDeleteLinkTarget(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    }
  })

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

  const handleCreateLinkOpen = () => {
    setEditingLink(null)
    setIsLinkAddOpen(true)
  }

  const linkResourceList = linkResources || []

  // ==================================================================================
  // Shared Render Logic
  // ==================================================================================

  const getPageHeaderActions = () => {
    const handleRefresh = () => {
      if (currentTab === 'files') refetchResources()
      else refetchLinks()
    }

    const handleAdd = () => {
      if (currentTab === 'files') openUploadModal()
      else handleCreateLinkOpen()
    }

    const addTooltip = currentTab === 'files' ? '리소스 파일 추가' : '링크 리소스 추가'

    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>새로고침</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleAdd} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{addTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </>
    )
  }

  const error = currentTab === 'files' ? resourcesError : linksError
  const refetch = currentTab === 'files' ? refetchResources : refetchLinks

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

      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          icon={<Download className="h-5 w-5 text-primary" />}
          title="리소스 관리"
          actions={getPageHeaderActions()}
        />

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              파일
            </TabsTrigger>
            <TabsTrigger
              value="links"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              링크
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-8">
            {isResourcesLoading ? (
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
                onEdit={handleEditResource}
              />
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-8">
            {isLinksLoading ? (
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
          </TabsContent>
        </Tabs>
      </div>

      {/* File Upload Form */}
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

      {/* File Edit Form */}
      <ResourceEditForm
        isOpen={editingResource !== null}
        resource={editingResource}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleEditResourceSubmit}
        onClose={() => setEditingResource(null)}
      />

      {/* File Delete Dialog */}
      <ResourceDeleteDialog
        isOpen={deleteTarget !== null}
        isDeleting={deleteMutation.isPending}
        resourceName={deleteTarget?.resourceFileName || deleteTarget?.fileName || ''}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.resourceFileId)}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Link Add/Edit Form (Sheet) */}
      <LinkResourceForm
        isOpen={isLinkAddOpen}
        mode={editingLink ? 'update' : 'create'}
        initialData={editingLink}
        isSubmitting={editingLink ? updateLinkMutation.isPending : createLinkMutation.isPending}
        onSubmit={handleLinkSubmit}
        onClose={() => setIsLinkAddOpen(false)}
      />

      {/* Link Delete Dialog (Simple AlertDialog) */}
      <AlertDialog open={deleteLinkTarget !== null} onOpenChange={(open) => !open && setDeleteLinkTarget(null)}>
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
    </div>
  )
}
