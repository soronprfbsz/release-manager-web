/**
 * Project List Page
 * 프로젝트 관리 페이지 - 관리/온보딩 탭 구성
 */

import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  Plus,
  Folder,
  FolderOpen,
  File,
  Download,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  FolderPlus,
} from 'lucide-react'

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useOnboardingFiles,
  useOnboardingFileContent,
  useUploadOnboardingFile,
  useDeleteOnboardingFile,
  useCreateOnboardingDirectory,
  projectApi,
  type Project,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type OnboardingFileNode,
} from '@/entities/operations/project'
import { fileDownloadApi } from '@/shared/api'
import {
  ProjectList,
  ProjectForm,
  ProjectDeleteDialog,
  validateProjectForm,
  type ProjectFormData,
  type ProjectFormMode,
} from '@/features/operations/project-management'
import {
  OnboardingFileUploadSheet,
  OnboardingFileDeleteDialog,
  OnboardingDirectoryCreateDialog,
  INITIAL_UPLOAD_FORM_DATA,
  type OnboardingFileUploadFormData,
  type OnboardingFileDeleteTarget,
} from '@/features/operations/onboarding-management'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { base64ToText, isPdfFile as checkIsPdfFile, isImageFile as checkIsImageFile, isZipFile as checkIsZipFile, base64ToBlob } from '@/shared/lib/utils/file-content'
import { formatFileSize } from '@/shared/lib/utils/format'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ContentCard } from '@/shared/ui/content-layout'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ZipFileExplorer } from '@/shared/ui/zip-file-explorer'
import { PageLayout } from '@/shared/ui/page-layout'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'

type TabType = 'management' | 'onboarding'

const TAB_CONFIG = {
  management: {
    icon: DOMAIN_ICONS.projectManagement,
    label: '관리',
    addTooltip: '프로젝트 추가',
  },
  onboarding: {
    icon: DOMAIN_ICONS.onboarding,
    label: '온보딩',
    addTooltip: '',
  },
} as const

const INITIAL_FORM_DATA: ProjectFormData = {
  projectId: '',
  projectName: '',
  description: '',
}

export function ProjectListPage() {
  const { toast } = useToast()
  const { startTransfer, handleProgress, completeTransfer, resetTransfer, transferState } = useFileTransferProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'management'

  // Form state
  const [formMode, setFormMode] = useState<ProjectFormMode>(null)
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  // Onboarding tab state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // File viewer state
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ filePath: string; name: string; size?: number } | null>(null)

  // Onboarding file upload state
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)
  const [uploadFormData, setUploadFormData] = useState<OnboardingFileUploadFormData>(INITIAL_UPLOAD_FORM_DATA)

  // Onboarding file delete state
  const [onboardingDeleteTarget, setOnboardingDeleteTarget] = useState<OnboardingFileDeleteTarget | null>(null)

  // Onboarding directory create state
  const [directoryCreateParentPath, setDirectoryCreateParentPath] = useState<string | null>(null)

  // Queries & Mutations
  const { data: projects = [], isLoading } = useProjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  // Onboarding files query
  const { data: onboardingData, isLoading: isLoadingOnboarding } = useOnboardingFiles(
    selectedProjectId,
    { enabled: !!selectedProjectId && currentTab === 'onboarding' }
  )

  // Onboarding file upload/delete/directory mutations
  const uploadMutation = useUploadOnboardingFile(selectedProjectId)
  const deleteOnboardingMutation = useDeleteOnboardingFile(selectedProjectId)
  const createDirectoryMutation = useCreateOnboardingDirectory(selectedProjectId)

  // File content query - API 응답의 filePath 직접 사용
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useOnboardingFileContent(
    selectedFile?.filePath ?? '',
    fileViewerOpen && selectedFile !== null
  )

  // PDF/이미지/ZIP 파일 여부 확인
  const isPdfFile = selectedFile ? checkIsPdfFile(selectedFile.name) : false
  const isImageFile = selectedFile ? checkIsImageFile(selectedFile.name) : false
  const isZipFile = selectedFile ? checkIsZipFile(selectedFile.name) : false

  // 바이너리 데이터 처리 (PDF, 이미지, ZIP)
  const blobData = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (!isPdfFile && !isImageFile && !isZipFile) return null
    return base64ToBlob(fileContentData.content, fileContentData.mimeType)
  }, [fileContentData, isPdfFile, isImageFile, isZipFile])

  // 텍스트 콘텐츠 처리 (PDF, 이미지, ZIP 제외)
  const textContent = useMemo(() => {
    if (!fileContentData) return null
    if (isPdfFile || isImageFile || isZipFile) return null
    if (fileContentData.isBinary) {
      return base64ToText(fileContentData.content)
    }
    return fileContentData.content
  }, [fileContentData, isPdfFile, isImageFile, isZipFile])

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Management tab handlers
  const handleAddClick = () => {
    setFormData(INITIAL_FORM_DATA)
    setFormErrors({})
    setEditingProject(null)
    setIsEnabled(true)
    setFormMode('create')
  }

  const handleEdit = (project: Project) => {
    setFormData({
      projectId: project.projectId,
      projectName: project.projectName,
      description: project.description || '',
    })
    setFormErrors({})
    setEditingProject(project)
    setIsEnabled(project.isEnabled)
    setFormMode('edit')
  }

  const handleDelete = (project: Project) => {
    setDeleteTarget(project)
  }

  const handleFormClose = () => {
    setFormMode(null)
    setFormData(INITIAL_FORM_DATA)
    setFormErrors({})
    setEditingProject(null)
  }

  const handleFormSubmit = () => {
    const validation = validateProjectForm(formData, formMode as 'create' | 'edit')
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      return
    }

    if (formMode === 'create') {
      const request: ProjectCreateRequest = {
        projectId: formData.projectId.trim(),
        projectName: formData.projectName.trim(),
        description: formData.description.trim() || undefined,
        isEnabled,
      }

      createMutation.mutate(request, {
        onSuccess: () => {
          toast({ title: '프로젝트가 생성되었습니다.' })
          handleFormClose()
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '프로젝트 생성 실패',
            description: error.message,
          })
        },
      })
    } else if (formMode === 'edit' && editingProject) {
      const request: ProjectUpdateRequest = {
        projectName: formData.projectName.trim(),
        description: formData.description.trim() || undefined,
        isEnabled,
      }

      updateMutation.mutate(
        { id: editingProject.projectId, data: request },
        {
          onSuccess: () => {
            toast({ title: '프로젝트가 수정되었습니다.' })
            handleFormClose()
          },
          onError: (error) => {
            toast({
              variant: 'destructive',
              title: '프로젝트 수정 실패',
              description: error.message,
            })
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.projectId, {
      onSuccess: () => {
        toast({ title: '프로젝트가 삭제되었습니다.' })
        setDeleteTarget(null)
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '프로젝트 삭제 실패',
          description: error.message,
        })
      },
    })
  }

  const currentTabConfig = TAB_CONFIG[currentTab]

  // 선택된 프로젝트 정보
  const selectedProject = projects.find((p) => p.projectId === selectedProjectId)

  // 파일 클릭 핸들러 (내용 조회)
  const handleFileClick = (node: OnboardingFileNode) => {
    const fileName = node.name.toLowerCase()
    const viewableExtensions = ['.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
      '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env', '.pdf',
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.zip']

    if (viewableExtensions.some(ext => fileName.endsWith(ext))) {
      setSelectedFile({ filePath: node.filePath, name: node.name, size: node.size })
      setFileViewerOpen(true)
    }
  }

  // 파일 다운로드 핸들러 - API 응답의 filePath 직접 사용
  const handleFileDownload = (node: OnboardingFileNode) => {
    fileDownloadApi.download(node.filePath, node.name)
  }

  // 선택된 파일 다운로드 핸들러
  const handleDownloadSelectedFile = () => {
    if (selectedFile) {
      fileDownloadApi.download(selectedFile.filePath, selectedFile.name)
    }
  }

  // 온보딩 전체 파일 다운로드 핸들러
  const handleDownloadAllOnboardingFiles = async () => {
    if (!selectedProjectId || transferState.isTransferring) return

    const filename = `${selectedProjectId}_onboarding_files.zip`
    startTransfer(filename, 'download')

    try {
      await projectApi.downloadOnboardingFiles(selectedProjectId, filename, handleProgress)
      completeTransfer()
    } catch (error) {
      resetTransfer()
      toast({
        variant: 'destructive',
        title: '다운로드 실패',
        description: error instanceof Error ? error.message : '파일 다운로드 중 오류가 발생했습니다.',
      })
    }
  }

  // onboardings/{projectId}/ prefix 제거 유틸
  const stripOnboardingPrefix = (fullPath: string): string => {
    const prefix = `onboardings/${selectedProjectId}/`
    if (fullPath.startsWith(prefix)) {
      return '/' + fullPath.slice(prefix.length)
    }
    return fullPath
  }

  // 온보딩 파일 업로드 핸들러
  const handleUploadClick = (targetPath: string = '/') => {
    const cleanPath = stripOnboardingPrefix(targetPath)
    setUploadFormData({ ...INITIAL_UPLOAD_FORM_DATA, targetPath: cleanPath })
    setUploadSheetOpen(true)
  }

  const handleUploadSubmit = () => {
    if (!uploadFormData.file) return

    uploadMutation.mutate(
      {
        file: uploadFormData.file,
        targetPath: uploadFormData.targetPath,
        extractZip: uploadFormData.extractZip,
      },
      {
        onSuccess: () => {
          toast({ title: '파일이 업로드되었습니다.' })
          setUploadSheetOpen(false)
          setUploadFormData(INITIAL_UPLOAD_FORM_DATA)
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '업로드 실패',
            description: error.message,
          })
        },
      }
    )
  }

  // 온보딩 파일 삭제 핸들러
  const handleOnboardingDeleteClick = (node: OnboardingFileNode) => {
    setOnboardingDeleteTarget({
      name: node.name,
      path: stripOnboardingPrefix(node.filePath),
      type: node.type,
    })
  }

  const handleOnboardingDeleteConfirm = () => {
    if (!onboardingDeleteTarget) return

    deleteOnboardingMutation.mutate(onboardingDeleteTarget.path, {
      onSuccess: () => {
        toast({ title: `${onboardingDeleteTarget.type === 'directory' ? '폴더' : '파일'}가 삭제되었습니다.` })
        setOnboardingDeleteTarget(null)
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

  // 온보딩 디렉토리 생성 핸들러
  const handleCreateDirectoryClick = (parentPath: string = '/') => {
    const cleanPath = stripOnboardingPrefix(parentPath)
    setDirectoryCreateParentPath(cleanPath)
  }

  const handleCreateDirectoryConfirm = (directoryName: string) => {
    if (!directoryCreateParentPath) return

    const fullPath = directoryCreateParentPath === '/'
      ? `/${directoryName}`
      : `${directoryCreateParentPath}/${directoryName}`

    createDirectoryMutation.mutate(fullPath, {
      onSuccess: () => {
        toast({ title: '폴더가 생성되었습니다.' })
        setDirectoryCreateParentPath(null)
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
    <PageLayout
      actions={
        currentTab === 'management' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAddClick} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentTabConfig.addTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : currentTab === 'onboarding' && selectedProjectId ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUploadClick('/')}>
                <File className="h-4 w-4 mr-2" />
                파일 추가
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateDirectoryClick('/')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                폴더 추가
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null
      }
    >
      <ContentCard noPadding>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          {/* Tab Header */}
          <div className="flex items-center justify-between px-8 pt-2">
            <TabsList variant="line" className="border-0">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tabKey) => {
                const config = TAB_CONFIG[tabKey]
                const Icon = config.icon
                return (
                  <TabsTrigger key={tabKey} value={tabKey} variant="line">
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* 온보딩 탭 필터 */}
            {currentTab === 'onboarding' && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="프로젝트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 관리 탭 */}
          <TabsContent value="management" className="mt-0 pt-0">
            <div className="px-8 pb-6 pt-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ProjectList
                  projects={projects}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </TabsContent>

          {/* 온보딩 탭 */}
          <TabsContent value="onboarding" className="mt-0 pt-0">
            <div className="px-8 pb-6 pt-4" style={{ height: 'calc(100vh - 22.5rem)' }}>
              {!selectedProjectId ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <DOMAIN_ICONS.onboarding className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">프로젝트를 선택해주세요.</p>
                </div>
              ) : isLoadingOnboarding ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : !onboardingData?.hasFiles ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <DOMAIN_ICONS.onboarding className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">온보딩 파일이 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* 파일 정보 헤더 */}
                  <div className="flex items-center justify-between text-sm pb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <DOMAIN_ICONS.project className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{selectedProject?.projectName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{onboardingData.totalFileCount}개 파일</span>
                        <span>•</span>
                        <span>{formatFileSize(onboardingData.totalSize)}</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDownloadAllOnboardingFiles}
                            disabled={transferState.isTransferring}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>전체 다운로드</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* 파일 트리 - 내부 스크롤 */}
                  <ScrollArea className="flex-1">
                    <OnboardingFileTree
                      files={onboardingData.files}
                      onFileClick={handleFileClick}
                      onDownload={handleFileDownload}
                      onUpload={handleUploadClick}
                      onDelete={handleOnboardingDeleteClick}
                      onCreateDirectory={handleCreateDirectoryClick}
                    />
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ContentCard>

      {/* 프로젝트 생성/수정 폼 */}
      <ProjectForm
        mode={formMode}
        formData={formData}
        isEnabled={isEnabled}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        errors={formErrors}
        onFormDataChange={setFormData}
        onEnabledChange={setIsEnabled}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ProjectDeleteDialog
        isOpen={deleteTarget !== null}
        projectName={deleteTarget?.projectName || ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 파일 내용 조회 모달 (ZIP 파일 제외) */}
      <FileContentViewerModal
        open={fileViewerOpen && !isZipFile}
        onOpenChange={setFileViewerOpen}
        fileName={selectedFile?.name || ''}
        content={textContent}
        isLoading={isLoadingContent && !isPdfFile && !isImageFile}
        error={!isPdfFile && !isImageFile ? contentError : null}
        description="온보딩 파일"
        fileSize={selectedFile?.size}
        onDownload={handleDownloadSelectedFile}
        canDownload={true}
        pdfBlob={isPdfFile ? blobData : null}
        isPdfLoading={isPdfFile && isLoadingContent}
        pdfError={isPdfFile ? contentError : null}
        imageBlob={isImageFile ? blobData : null}
        isImageLoading={isImageFile && isLoadingContent}
        imageError={isImageFile ? contentError : null}
      />

      {/* ZIP 파일 탐색기 */}
      <ZipFileExplorer
        open={fileViewerOpen && isZipFile}
        onOpenChange={setFileViewerOpen}
        zipBlob={isZipFile ? blobData : null}
        fileName={selectedFile?.name || ''}
        isLoading={isZipFile && isLoadingContent}
        error={isZipFile ? contentError : null}
      />

      {/* 온보딩 파일 업로드 시트 */}
      <OnboardingFileUploadSheet
        isOpen={uploadSheetOpen}
        formData={uploadFormData}
        isUploading={uploadMutation.isPending}
        onFormDataChange={setUploadFormData}
        onSubmit={handleUploadSubmit}
        onClose={() => {
          setUploadSheetOpen(false)
          setUploadFormData(INITIAL_UPLOAD_FORM_DATA)
        }}
      />

      {/* 온보딩 파일 삭제 확인 다이얼로그 */}
      <OnboardingFileDeleteDialog
        target={onboardingDeleteTarget}
        isDeleting={deleteOnboardingMutation.isPending}
        onConfirm={handleOnboardingDeleteConfirm}
        onCancel={() => setOnboardingDeleteTarget(null)}
      />

      {/* 온보딩 디렉토리 생성 다이얼로그 */}
      <OnboardingDirectoryCreateDialog
        isOpen={directoryCreateParentPath !== null}
        parentPath={directoryCreateParentPath || '/'}
        isCreating={createDirectoryMutation.isPending}
        onConfirm={handleCreateDirectoryConfirm}
        onCancel={() => setDirectoryCreateParentPath(null)}
      />
    </PageLayout>
  )
}

/** 온보딩 파일 트리 컴포넌트 */
interface OnboardingFileTreeProps {
  files: OnboardingFileNode
  onFileClick: (node: OnboardingFileNode) => void
  onDownload: (node: OnboardingFileNode) => void
  onUpload: (targetPath: string) => void
  onDelete: (node: OnboardingFileNode) => void
  onCreateDirectory: (parentPath: string) => void
}

function OnboardingFileTree({ files, onFileClick, onDownload, onUpload, onDelete, onCreateDirectory }: OnboardingFileTreeProps) {
  return (
    <div className="space-y-1">
      {files.children?.map((node) => (
        <OnboardingFileTreeNode
          key={node.path}
          node={node}
          level={0}
          onFileClick={onFileClick}
          onDownload={onDownload}
          onUpload={onUpload}
          onDelete={onDelete}
          onCreateDirectory={onCreateDirectory}
        />
      ))}
    </div>
  )
}

interface OnboardingFileTreeNodeProps {
  node: OnboardingFileNode
  level: number
  onFileClick: (node: OnboardingFileNode) => void
  onDownload: (node: OnboardingFileNode) => void
  onUpload: (targetPath: string) => void
  onDelete: (node: OnboardingFileNode) => void
  onCreateDirectory: (parentPath: string) => void
}

function OnboardingFileTreeNode({ node, level, onFileClick, onDownload, onUpload, onDelete, onCreateDirectory }: OnboardingFileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 디렉토리 렌더링
  if (node.type === 'directory') {
    const sortedChildren = node.children ? [...node.children].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    }) : []

    return (
      <div>
        <div
          className="group flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpload(node.filePath)}>
                <File className="h-4 w-4 mr-2" />
                파일 추가
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateDirectory(node.filePath)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                폴더 추가
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(node)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && sortedChildren.length > 0 && (
          <div>
            {sortedChildren.map((child, index) => (
              <OnboardingFileTreeNode
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                onDownload={onDownload}
                onUpload={onUpload}
                onDelete={onDelete}
                onCreateDirectory={onCreateDirectory}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 파일 클릭 가능 여부 확인
  const fileName = node.name.toLowerCase()
  const isViewable = ['.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
    '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env', '.pdf',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.zip'].some(ext => fileName.endsWith(ext))

  // 파일 렌더링
  return (
    <div
      className="group flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
      style={{ paddingLeft: `${level * 16 + 24}px` }}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${isViewable ? 'cursor-pointer' : ''}`}
        onClick={() => isViewable && onFileClick(node)}
      >
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {node.size !== undefined && (
          <span className="text-xs text-muted-foreground">
            {formatFileSize(node.size)}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDownload(node)}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(node)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
