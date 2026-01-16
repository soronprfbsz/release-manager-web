/**
 * Project List Page
 * 프로젝트 관리 페이지
 */

import { useState } from 'react'
import { Plus } from 'lucide-react'

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  type Project,
  type ProjectCreateRequest,
  type ProjectUpdateRequest,
} from '@/entities/operations/project'
import {
  ProjectList,
  ProjectForm,
  ProjectDeleteDialog,
  validateProjectForm,
  type ProjectFormData,
  type ProjectFormMode,
} from '@/features/operations/project-management'

import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useToast } from '@/shared/lib/hooks/use-toast'

const INITIAL_FORM_DATA: ProjectFormData = {
  projectId: '',
  projectName: '',
  description: '',
}

export function ProjectListPage() {
  const { toast } = useToast()

  // Form state
  const [formMode, setFormMode] = useState<ProjectFormMode>(null)
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  // Queries & Mutations
  const { data: projects = [], isLoading } = useProjects()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  // Handlers
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

  return (
    <PageLayout
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleAddClick} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>프로젝트 추가</p>
          </TooltipContent>
        </Tooltip>
      }
    >
      <ContentCard>
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
    </PageLayout>
  )
}
