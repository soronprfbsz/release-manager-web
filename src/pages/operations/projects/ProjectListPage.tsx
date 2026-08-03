/**
 * Project List Page
 * 프로젝트 관리 페이지 - 관리/온보딩 탭 구성
 */

import { useState, useMemo } from 'react'

import {
  Plus,
  File,
  Download,
  FolderPlus,
  Search,
  X,
  ArrowUpDown,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'


import {
  InstallFileUploadSheet,
  InstallFileDeleteDialog,
  InstallDirectoryCreateDialog,
  INITIAL_INSTALL_UPLOAD_FORM_DATA,
  type InstallFileUploadFormData,
  type InstallFileDeleteTarget,
} from '@/features/operations/install-management'
import {
  OnboardingFileUploadSheet,
  OnboardingFileDeleteDialog,
  OnboardingDirectoryCreateDialog,
  INITIAL_UPLOAD_FORM_DATA,
  type OnboardingFileUploadFormData,
  type OnboardingFileDeleteTarget,
} from '@/features/operations/onboarding-management'
import {
  ProjectList,
  ProjectForm,
  ProjectDeleteDialog,
  validateProjectForm,
  type ProjectFormData,
  type ProjectFormMode,
} from '@/features/operations/project-management'

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
  useInstallFiles,
  useInstallFileContent,
  useUploadInstallFile,
  useDeleteInstallFile,
  useCreateInstallDirectory,
  projectApi,
  type Project,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
  type OnboardingFileNode,
  type InstallFileNode,
} from '@/entities/operations/project'

import { fileDownloadApi } from '@/shared/api'
import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { isViewableFile } from '@/shared/lib/utils/file-icon'
import { sortFileTree, FILE_SORT_OPTIONS, type FileSortBy, type FileSortDirection } from '@/shared/lib/utils/file-sort'
import { formatFileSize } from '@/shared/lib/utils/format'
import { useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { TabbedContentCard } from '@/shared/ui/content-layout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { FileTree, type FileTreeNode } from '@/shared/ui/file-tree'
import { FileViewer } from '@/shared/ui/file-viewer'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'management' | 'onboarding' | 'install'

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
  install: {
    icon: DOMAIN_ICONS.install,
    label: '인스톨',
    addTooltip: '',
  },
} as const

const INITIAL_FORM_DATA: ProjectFormData = {
  projectId: '',
  projectName: '',
  description: '',
  glyphText: '',
  glyphBackgroundColor: '',
}

export function ProjectListPage() {
  const { toast } = useToast()
  const { startTransfer, handleProgress, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [onboardingUploadCompleted, setOnboardingUploadCompleted] = useState(false)
  const [installUploadCompleted, setInstallUploadCompleted] = useState(false)
  const { canCreateProject, canEditProject, canDeleteProject, canManageProjectFiles } = usePermission()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'management'

  // 전역 프로젝트 ID (상단 헤더의 프로젝트 셀렉터에서 선택된 프로젝트)
  const projectId = useProjectStore((state) => state.projectId)

  // Form state
  const [formMode, setFormMode] = useState<ProjectFormMode>(null)
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

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

  // Install file viewer state
  const [installFileViewerOpen, setInstallFileViewerOpen] = useState(false)
  const [installSelectedFile, setInstallSelectedFile] = useState<{ filePath: string; name: string; size?: number } | null>(null)

  // Install file upload state
  const [installUploadSheetOpen, setInstallUploadSheetOpen] = useState(false)
  const [installUploadFormData, setInstallUploadFormData] = useState<InstallFileUploadFormData>(INITIAL_INSTALL_UPLOAD_FORM_DATA)

  // Install file delete state
  const [installDeleteTarget, setInstallDeleteTarget] = useState<InstallFileDeleteTarget | null>(null)

  // Install directory create state
  const [installDirectoryCreateParentPath, setInstallDirectoryCreateParentPath] = useState<string | null>(null)

  // Search state for file trees
  const [onboardingSearchKeyword, setOnboardingSearchKeyword] = useState('')
  const [installSearchKeyword, setInstallSearchKeyword] = useState('')

  // Sort state for file trees
  const [onboardingSortBy, setOnboardingSortBy] = useState<FileSortBy>('name')
  const [onboardingSortDirection, setOnboardingSortDirection] = useState<FileSortDirection>('asc')
  const [installSortBy, setInstallSortBy] = useState<FileSortBy>('name')
  const [installSortDirection, setInstallSortDirection] = useState<FileSortDirection>('asc')

  // Queries & Mutations
  const { data: projects = [], isLoading } = useProjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  // Onboarding files query
  const { data: onboardingData, isLoading: isLoadingOnboarding } = useOnboardingFiles(
    projectId,
    { enabled: !!projectId && currentTab === 'onboarding' }
  )

  // Onboarding file upload/delete/directory mutations
  const uploadMutation = useUploadOnboardingFile(projectId)
  const deleteOnboardingMutation = useDeleteOnboardingFile(projectId)
  const createDirectoryMutation = useCreateOnboardingDirectory(projectId)

  // Install files query
  const { data: installData, isLoading: isLoadingInstall } = useInstallFiles(
    projectId,
    { enabled: !!projectId && currentTab === 'install' }
  )

  // Install file upload/delete/directory mutations
  const installUploadMutation = useUploadInstallFile(projectId)
  const deleteInstallMutation = useDeleteInstallFile(projectId)
  const createInstallDirectoryMutation = useCreateInstallDirectory(projectId)

  // File content viewer hook (온보딩)
  const onboardingViewer = useFileContentViewer({
    filePath: selectedFile?.filePath,
    fileName: selectedFile?.name,
    fileSize: selectedFile?.size,
    enabled: fileViewerOpen && selectedFile !== null,
    useContentQuery: useOnboardingFileContent,
  })

  // File content viewer hook (인스톨)
  const installViewer = useFileContentViewer({
    filePath: installSelectedFile?.filePath,
    fileName: installSelectedFile?.name,
    fileSize: installSelectedFile?.size,
    enabled: installFileViewerOpen && installSelectedFile !== null,
    useContentQuery: useInstallFileContent,
  })

  // 파일 트리 키워드 필터링 함수 (온보딩)
  const filterOnboardingTree = (node: OnboardingFileNode, keyword: string): OnboardingFileNode | null => {
    const lowerKeyword = keyword.toLowerCase()
    const nameMatches = node.name.toLowerCase().includes(lowerKeyword)

    if (node.type === 'file') {
      return nameMatches ? node : null
    }

    const filteredChildren = node.children
      ?.map(child => filterOnboardingTree(child, keyword))
      .filter((child): child is OnboardingFileNode => child !== null)

    if (nameMatches || (filteredChildren && filteredChildren.length > 0)) {
      return { ...node, children: filteredChildren || [] }
    }
    return null
  }

  // 파일 트리 키워드 필터링 함수 (인스톨)
  const filterInstallTree = (node: InstallFileNode, keyword: string): InstallFileNode | null => {
    const lowerKeyword = keyword.toLowerCase()
    const nameMatches = node.name.toLowerCase().includes(lowerKeyword)

    if (node.type === 'file') {
      return nameMatches ? node : null
    }

    const filteredChildren = node.children
      ?.map(child => filterInstallTree(child, keyword))
      .filter((child): child is InstallFileNode => child !== null)

    if (nameMatches || (filteredChildren && filteredChildren.length > 0)) {
      return { ...node, children: filteredChildren || [] }
    }
    return null
  }

  // 필터링 및 소팅된 온보딩 파일 트리
  const filteredOnboardingFiles = useMemo(() => {
    if (!onboardingData?.files) return null

    // 1. 필터링 적용
    let result = onboardingSearchKeyword.trim()
      ? filterOnboardingTree(onboardingData.files, onboardingSearchKeyword.trim())
      : onboardingData.files

    // 2. 소팅 적용
    if (result) {
      result = sortFileTree(result, onboardingSortBy, onboardingSortDirection)
    }

    return result
  }, [onboardingData?.files, onboardingSearchKeyword, onboardingSortBy, onboardingSortDirection])

  // 필터링 및 소팅된 인스톨 파일 트리
  const filteredInstallFiles = useMemo(() => {
    if (!installData?.files) return null

    // 1. 필터링 적용
    let result = installSearchKeyword.trim()
      ? filterInstallTree(installData.files, installSearchKeyword.trim())
      : installData.files

    // 2. 소팅 적용
    if (result) {
      result = sortFileTree(result, installSortBy, installSortDirection)
    }

    return result
  }, [installData?.files, installSearchKeyword, installSortBy, installSortDirection])

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
      glyphText: project.glyphText || '',
      glyphBackgroundColor: project.glyphBackgroundColor || '',
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
        glyphText: formData.glyphText.trim() || undefined,
        glyphBackgroundColor: formData.glyphBackgroundColor.trim() || undefined,
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
        glyphText: formData.glyphText.trim(),
        glyphBackgroundColor: formData.glyphBackgroundColor.trim(),
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

  // 선택된 프로젝트 정보 (전역 프로젝트 셀렉터 기준)
  const selectedProject = projects.find((p) => p.projectId === projectId)

  // 파일 클릭 핸들러 (내용 조회)
  const handleFileClick = (node: OnboardingFileNode) => {
    if (isViewableFile(node.name)) {
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
  const handleDownloadAllOnboardingFiles = () => {
    if (!projectId) return
    projectApi.downloadOnboardingFiles(projectId)
  }

  // onboardings/{projectId}/ prefix 제거 유틸
  const stripOnboardingPrefix = (fullPath: string): string => {
    const prefix = `onboardings/${projectId}/`
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

    setOnboardingUploadCompleted(false)
    const controller = startTransfer(uploadFormData.file.name, 'upload')

    const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
      handleProgress(progressEvent)
      if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !onboardingUploadCompleted) {
        setOnboardingUploadCompleted(true)
        setTimeout(() => startServerProcessing(), 100)
      }
    }

    uploadMutation.mutate(
      {
        file: uploadFormData.file,
        targetPath: uploadFormData.targetPath,
        extractZip: uploadFormData.extractZip,
        onUploadProgress: progressHandler,
        signal: controller.signal,
      },
      {
        onSuccess: () => {
          completeTransfer()
          toast({ title: '파일이 업로드되었습니다.' })
          setUploadSheetOpen(false)
          setUploadFormData(INITIAL_UPLOAD_FORM_DATA)
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

  // ============================================================================
  // Install (인스톨) 핸들러
  // ============================================================================

  // installs/{projectId}/ prefix 제거 유틸
  const stripInstallPrefix = (fullPath: string): string => {
    const prefix = `installs/${projectId}/`
    if (fullPath.startsWith(prefix)) {
      return '/' + fullPath.slice(prefix.length)
    }
    return fullPath
  }

  // 인스톨 파일 클릭 핸들러 (내용 조회)
  const handleInstallFileClick = (node: InstallFileNode) => {
    if (isViewableFile(node.name)) {
      setInstallSelectedFile({ filePath: node.filePath, name: node.name, size: node.size })
      setInstallFileViewerOpen(true)
    }
  }

  // 인스톨 파일 다운로드 핸들러
  const handleInstallFileDownload = (node: InstallFileNode) => {
    fileDownloadApi.download(node.filePath, node.name)
  }

  // 인스톨 선택된 파일 다운로드 핸들러
  const handleDownloadInstallSelectedFile = () => {
    if (installSelectedFile) {
      fileDownloadApi.download(installSelectedFile.filePath, installSelectedFile.name)
    }
  }

  // 인스톨 전체 파일 다운로드 핸들러
  const handleDownloadAllInstallFiles = () => {
    if (!projectId) return
    projectApi.downloadInstallFiles(projectId)
  }

  // 인스톨 파일 업로드 핸들러
  const handleInstallUploadClick = (targetPath: string = '/') => {
    const cleanPath = stripInstallPrefix(targetPath)
    setInstallUploadFormData({ ...INITIAL_INSTALL_UPLOAD_FORM_DATA, targetPath: cleanPath })
    setInstallUploadSheetOpen(true)
  }

  const handleInstallUploadSubmit = () => {
    if (!installUploadFormData.file) return

    setInstallUploadCompleted(false)
    const controller = startTransfer(installUploadFormData.file.name, 'upload')

    const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
      handleProgress(progressEvent)
      if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !installUploadCompleted) {
        setInstallUploadCompleted(true)
        setTimeout(() => startServerProcessing(), 100)
      }
    }

    installUploadMutation.mutate(
      {
        file: installUploadFormData.file,
        targetPath: installUploadFormData.targetPath,
        extractZip: installUploadFormData.extractZip,
        onUploadProgress: progressHandler,
        signal: controller.signal,
      },
      {
        onSuccess: () => {
          completeTransfer()
          toast({ title: '파일이 업로드되었습니다.' })
          setInstallUploadSheetOpen(false)
          setInstallUploadFormData(INITIAL_INSTALL_UPLOAD_FORM_DATA)
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

  // 인스톨 파일 삭제 핸들러
  const handleInstallDeleteClick = (node: InstallFileNode) => {
    setInstallDeleteTarget({
      name: node.name,
      path: stripInstallPrefix(node.filePath),
      type: node.type,
    })
  }

  const handleInstallDeleteConfirm = () => {
    if (!installDeleteTarget) return

    deleteInstallMutation.mutate(installDeleteTarget.path, {
      onSuccess: () => {
        toast({ title: `${installDeleteTarget.type === 'directory' ? '폴더' : '파일'}가 삭제되었습니다.` })
        setInstallDeleteTarget(null)
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

  // 인스톨 디렉토리 생성 핸들러
  const handleInstallCreateDirectoryClick = (parentPath: string = '/') => {
    const cleanPath = stripInstallPrefix(parentPath)
    setInstallDirectoryCreateParentPath(cleanPath)
  }

  const handleInstallCreateDirectoryConfirm = (directoryName: string) => {
    if (!installDirectoryCreateParentPath) return

    const fullPath = installDirectoryCreateParentPath === '/'
      ? `/${directoryName}`
      : `${installDirectoryCreateParentPath}/${directoryName}`

    createInstallDirectoryMutation.mutate(fullPath, {
      onSuccess: () => {
        toast({ title: '폴더가 생성되었습니다.' })
        setInstallDirectoryCreateParentPath(null)
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
        currentTab === 'management' && canCreateProject ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAddClick} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentTabConfig.addTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : currentTab === 'onboarding' && projectId && canManageProjectFiles ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
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
        ) : currentTab === 'install' && projectId && canManageProjectFiles ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleInstallUploadClick('/')}>
                <File className="h-4 w-4 mr-2" />
                파일 추가
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInstallCreateDirectoryClick('/')}>
                <FolderPlus className="h-4 w-4 mr-2" />
                폴더 추가
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null
      }
    >
      <TabbedContentCard
        value={currentTab}
        onValueChange={handleTabChange}
        tabs={[
          {
            value: 'management',
            label: TAB_CONFIG.management.label,
            icon: TAB_CONFIG.management.icon,
            contentClassName: 'mt-0 pt-0',
            content: (
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
                    showEdit={canEditProject}
                    showDelete={canDeleteProject}
                  />
                )}
              </div>
            ),
          },
          {
            value: 'onboarding',
            label: TAB_CONFIG.onboarding.label,
            icon: TAB_CONFIG.onboarding.icon,
            contentClassName: 'mt-0 pt-0',
            content: (
              <div className="px-8 pb-6 pt-4">
                {!projectId ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                    <DOMAIN_ICONS.onboarding className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">상단에서 프로젝트를 선택해주세요.</p>
                  </div>
                ) : isLoadingOnboarding ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !onboardingData?.hasFiles ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                    <DOMAIN_ICONS.onboarding className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">온보딩 파일이 없습니다.</p>
                  </div>
                ) : (
                  <div>
                    {/* 파일 정보 헤더 */}
                    <div className="flex items-center justify-between text-sm pb-4">
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
                              size="icon-xs"
                              onClick={handleDownloadAllOnboardingFiles}
                            >
                              <Download />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>전체 다운로드</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* 파일 트리 — 자연 흐름, 페이지가 길어지면 main 이 스크롤 */}
                    {filteredOnboardingFiles?.children && filteredOnboardingFiles.children.length > 0 ? (
                      <FileTree
                        data={filteredOnboardingFiles as FileTreeNode}
                        onFileClick={(node) => handleFileClick(node as OnboardingFileNode)}
                        onDownload={(node) => handleFileDownload(node as OnboardingFileNode)}
                        onUpload={handleUploadClick}
                        onDelete={(node) => handleOnboardingDeleteClick(node as OnboardingFileNode)}
                        onCreateDirectory={handleCreateDirectoryClick}
                        canManage={canManageProjectFiles}
                        showModifiedDate
                        defaultExpanded={false}
                      />
                    ) : onboardingSearchKeyword.trim() ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">검색 결과가 없습니다.</p>
                      </div>
                    ) : (
                      <FileTree
                        data={onboardingData.files as FileTreeNode}
                        onFileClick={(node) => handleFileClick(node as OnboardingFileNode)}
                        onDownload={(node) => handleFileDownload(node as OnboardingFileNode)}
                        onUpload={handleUploadClick}
                        onDelete={(node) => handleOnboardingDeleteClick(node as OnboardingFileNode)}
                        onCreateDirectory={handleCreateDirectoryClick}
                        canManage={canManageProjectFiles}
                        showModifiedDate
                        defaultExpanded={false}
                      />
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            value: 'install',
            label: TAB_CONFIG.install.label,
            icon: TAB_CONFIG.install.icon,
            contentClassName: 'mt-0 pt-0',
            content: (
              <div className="px-8 pb-6 pt-4">
                {!projectId ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                    <DOMAIN_ICONS.install className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">상단에서 프로젝트를 선택해주세요.</p>
                  </div>
                ) : isLoadingInstall ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : !installData?.hasFiles ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                    <DOMAIN_ICONS.install className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">인스톨 파일이 없습니다.</p>
                  </div>
                ) : (
                  <div>
                    {/* 파일 정보 헤더 */}
                    <div className="flex items-center justify-between text-sm pb-4">
                      <div className="flex items-center gap-2">
                        <DOMAIN_ICONS.project className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{selectedProject?.projectName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>{installData.totalFileCount}개 파일</span>
                          <span>•</span>
                          <span>{formatFileSize(installData.totalSize)}</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={handleDownloadAllInstallFiles}
                            >
                              <Download />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>전체 다운로드</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* 파일 트리 — 자연 흐름, 페이지가 길어지면 main 이 스크롤 */}
                    {filteredInstallFiles?.children && filteredInstallFiles.children.length > 0 ? (
                      <FileTree
                        data={filteredInstallFiles as FileTreeNode}
                        onFileClick={(node) => handleInstallFileClick(node as InstallFileNode)}
                        onDownload={(node) => handleInstallFileDownload(node as InstallFileNode)}
                        onUpload={handleInstallUploadClick}
                        onDelete={(node) => handleInstallDeleteClick(node as InstallFileNode)}
                        onCreateDirectory={handleInstallCreateDirectoryClick}
                        canManage={canManageProjectFiles}
                        showModifiedDate
                        defaultExpanded={false}
                      />
                    ) : installSearchKeyword.trim() ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">검색 결과가 없습니다.</p>
                      </div>
                    ) : (
                      <FileTree
                        data={installData.files as FileTreeNode}
                        onFileClick={(node) => handleInstallFileClick(node as InstallFileNode)}
                        onDownload={(node) => handleInstallFileDownload(node as InstallFileNode)}
                        onUpload={handleInstallUploadClick}
                        onDelete={(node) => handleInstallDeleteClick(node as InstallFileNode)}
                        onCreateDirectory={handleInstallCreateDirectoryClick}
                        canManage={canManageProjectFiles}
                        showModifiedDate
                        defaultExpanded={false}
                      />
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
        headerRight={
          /* 정렬·검색 — 온보딩/인스톨 탭에서만 표시 */
          (currentTab === 'onboarding' || currentTab === 'install') ? (
            <div className="flex items-center gap-2">
              <Select
                value={`${currentTab === 'onboarding' ? onboardingSortBy : installSortBy}-${currentTab === 'onboarding' ? onboardingSortDirection : installSortDirection}`}
                onValueChange={(value) => {
                  const option = FILE_SORT_OPTIONS.find((opt) => opt.value === value)
                  if (option) {
                    if (currentTab === 'onboarding') {
                      setOnboardingSortBy(option.sortBy)
                      setOnboardingSortDirection(option.direction)
                    } else {
                      setInstallSortBy(option.sortBy)
                      setInstallSortDirection(option.direction)
                    }
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/50 border-0">
                  <ArrowUpDown className="h-3 w-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={currentTab === 'onboarding' ? onboardingSearchKeyword : installSearchKeyword}
                  onChange={(e) => currentTab === 'onboarding'
                    ? setOnboardingSearchKeyword(e.target.value)
                    : setInstallSearchKeyword(e.target.value)
                  }
                  placeholder="검색..."
                  className="pl-8 pr-8 h-8 w-[200px] text-xs bg-muted/50 border-0"
                />
                {(currentTab === 'onboarding' ? onboardingSearchKeyword : installSearchKeyword) && (
                  <button
                    type="button"
                    onClick={() => currentTab === 'onboarding'
                      ? setOnboardingSearchKeyword('')
                      : setInstallSearchKeyword('')
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          ) : null
        }
      />

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

      {/* 온보딩 파일 내용 조회 */}
      <FileViewer
        {...onboardingViewer.viewerProps}
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        onDownload={handleDownloadSelectedFile}
        canDownload={true}
        description="온보딩 파일"
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

      {/* 인스톨 파일 내용 조회 */}
      <FileViewer
        {...installViewer.viewerProps}
        open={installFileViewerOpen}
        onOpenChange={setInstallFileViewerOpen}
        onDownload={handleDownloadInstallSelectedFile}
        canDownload={true}
        description="인스톨 파일"
      />

      {/* 인스톨 파일 업로드 시트 */}
      <InstallFileUploadSheet
        isOpen={installUploadSheetOpen}
        formData={installUploadFormData}
        isUploading={installUploadMutation.isPending}
        onFormDataChange={setInstallUploadFormData}
        onSubmit={handleInstallUploadSubmit}
        onClose={() => {
          setInstallUploadSheetOpen(false)
          setInstallUploadFormData(INITIAL_INSTALL_UPLOAD_FORM_DATA)
        }}
      />

      {/* 인스톨 파일 삭제 확인 다이얼로그 */}
      <InstallFileDeleteDialog
        target={installDeleteTarget}
        isDeleting={deleteInstallMutation.isPending}
        onConfirm={handleInstallDeleteConfirm}
        onCancel={() => setInstallDeleteTarget(null)}
      />

      {/* 인스톨 디렉토리 생성 다이얼로그 */}
      <InstallDirectoryCreateDialog
        isOpen={installDirectoryCreateParentPath !== null}
        parentPath={installDirectoryCreateParentPath || '/'}
        isCreating={createInstallDirectoryMutation.isPending}
        onConfirm={handleInstallCreateDirectoryConfirm}
        onCancel={() => setInstallDirectoryCreateParentPath(null)}
      />
    </PageLayout>
  )
}

