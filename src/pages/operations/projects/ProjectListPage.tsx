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
} from 'lucide-react'

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useOnboardingFiles,
  useOnboardingFileContent,
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

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { base64ToText, isPdfFile as checkIsPdfFile, isImageFile as checkIsImageFile, base64ToBlob } from '@/shared/lib/utils/file-content'
import { formatFileSize } from '@/shared/lib/utils/format'
import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
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

  // File content query - API 응답의 filePath 직접 사용
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useOnboardingFileContent(
    selectedFile?.filePath ?? '',
    fileViewerOpen && selectedFile !== null
  )

  // PDF/이미지 파일 여부 확인
  const isPdfFile = selectedFile ? checkIsPdfFile(selectedFile.name) : false
  const isImageFile = selectedFile ? checkIsImageFile(selectedFile.name) : false

  // 바이너리 데이터 처리
  const blobData = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (!isPdfFile && !isImageFile) return null
    return base64ToBlob(fileContentData.content, fileContentData.mimeType)
  }, [fileContentData, isPdfFile, isImageFile])

  // 텍스트 콘텐츠 처리
  const textContent = useMemo(() => {
    if (!fileContentData) return null
    if (isPdfFile || isImageFile) return null
    if (fileContentData.isBinary) {
      return base64ToText(fileContentData.content)
    }
    return fileContentData.content
  }, [fileContentData, isPdfFile, isImageFile])

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
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico']

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
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{onboardingData.totalFileCount}개 파일</span>
                      <span>•</span>
                      <span>{formatFileSize(onboardingData.totalSize)}</span>
                    </div>
                  </div>

                  {/* 파일 트리 - 내부 스크롤 */}
                  <ScrollArea className="flex-1">
                    <OnboardingFileTree
                      files={onboardingData.files}
                      onFileClick={handleFileClick}
                      onDownload={handleFileDownload}
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

      {/* 파일 내용 조회 모달 */}
      <FileContentViewerModal
        open={fileViewerOpen}
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
    </PageLayout>
  )
}

/** 온보딩 파일 트리 컴포넌트 */
interface OnboardingFileTreeProps {
  files: OnboardingFileNode
  onFileClick: (node: OnboardingFileNode) => void
  onDownload: (node: OnboardingFileNode) => void
}

function OnboardingFileTree({ files, onFileClick, onDownload }: OnboardingFileTreeProps) {
  return (
    <div className="space-y-1">
      {files.children?.map((node) => (
        <OnboardingFileTreeNode
          key={node.path}
          node={node}
          level={0}
          onFileClick={onFileClick}
          onDownload={onDownload}
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
}

function OnboardingFileTreeNode({ node, level, onFileClick, onDownload }: OnboardingFileTreeNodeProps) {
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
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm font-medium">{node.name}</span>
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
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico'].some(ext => fileName.endsWith(ext))

  // 파일 렌더링
  return (
    <div
      className="flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onDownload(node)}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
