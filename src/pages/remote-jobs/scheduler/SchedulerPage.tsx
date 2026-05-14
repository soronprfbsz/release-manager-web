/**
 * Scheduler Page
 * 스케줄러 관리 페이지
 */

import { useState } from 'react'

import { Plus, RefreshCw } from 'lucide-react'

import {
  SchedulerTable,
  SchedulerForm,
  SchedulerDeleteDialog,
  SchedulerHistoryDialog,
  INITIAL_SCHEDULER_FORM_DATA,
  validateSchedulerForm,
  type SchedulerFormData,
  type SchedulerFormMode,
} from '@/features/remote-jobs'

import {
  useScheduleJobs,
  useCreateScheduleJob,
  useUpdateScheduleJob,
  useDeleteScheduleJob,
  useToggleScheduleJob,
  useExecuteScheduleJob,
  useRefreshScheduleJobs,
  type ScheduleJob,
} from '@/entities/remote-jobs'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function SchedulerPage() {
  const { toast } = useToast()

  // Form state
  const [formMode, setFormMode] = useState<SchedulerFormMode>(null)
  const [editingJob, setEditingJob] = useState<ScheduleJob | null>(null)
  const [formData, setFormData] = useState<SchedulerFormData>(INITIAL_SCHEDULER_FORM_DATA)

  // Delete state
  const [deletingJob, setDeletingJob] = useState<ScheduleJob | null>(null)

  // History state
  const [historyJob, setHistoryJob] = useState<ScheduleJob | null>(null)

  // Query
  const { data: jobs = [], isLoading } = useScheduleJobs()

  // Mutations
  const createMutation = useCreateScheduleJob()
  const updateMutation = useUpdateScheduleJob()
  const deleteMutation = useDeleteScheduleJob()
  const toggleMutation = useToggleScheduleJob()
  const executeMutation = useExecuteScheduleJob()
  const refreshMutation = useRefreshScheduleJobs()

  // Handlers
  const openCreateForm = () => {
    setFormData(INITIAL_SCHEDULER_FORM_DATA)
    setEditingJob(null)
    setFormMode('create')
  }

  const openEditForm = (job: ScheduleJob) => {
    setFormData({
      jobName: job.jobName,
      jobGroup: job.jobGroup,
      description: job.description || '',
      apiUrl: job.apiUrl,
      httpMethod: job.httpMethod,
      requestBody: job.requestBody || '',
      requestHeaders: job.requestHeaders || '',
      cronExpression: job.cronExpression,
      timezone: job.timezone,
      isEnabled: job.isEnabled,
      timeoutSeconds: job.timeoutSeconds,
      retryCount: job.retryCount,
      retryDelaySeconds: job.retryDelaySeconds,
    })
    setEditingJob(job)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingJob(null)
    setFormData(INITIAL_SCHEDULER_FORM_DATA)
  }

  const handleSubmit = () => {
    const validation = validateSchedulerForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    const request = {
      jobName: formData.jobName.trim(),
      jobGroup: formData.jobGroup.trim() || 'DEFAULT',
      description: formData.description.trim() || undefined,
      apiUrl: formData.apiUrl.trim(),
      httpMethod: formData.httpMethod,
      requestBody: formData.requestBody.trim() || undefined,
      requestHeaders: formData.requestHeaders.trim() || undefined,
      cronExpression: formData.cronExpression.trim(),
      timezone: formData.timezone,
      isEnabled: formData.isEnabled,
      timeoutSeconds: formData.timeoutSeconds,
      retryCount: formData.retryCount,
      retryDelaySeconds: formData.retryDelaySeconds,
    }

    if (formMode === 'create') {
      createMutation.mutate(request, {
        onSuccess: () => {
          toast({ title: '스케줄 생성 완료', description: '새 스케줄이 등록되었습니다.' })
          closeForm()
        },
        onError: createErrorHandler(toast, '생성 실패'),
      })
    } else if (formMode === 'edit' && editingJob) {
      updateMutation.mutate(
        { jobId: editingJob.jobId, request },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '스케줄 정보가 수정되었습니다.' })
            closeForm()
          },
          onError: createErrorHandler(toast, '수정 실패'),
        }
      )
    }
  }

  const handleDelete = (job: ScheduleJob) => {
    setDeletingJob(job)
  }

  const handleDeleteConfirm = () => {
    if (deletingJob) {
      deleteMutation.mutate(deletingJob.jobId, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '스케줄이 삭제되었습니다.' })
          setDeletingJob(null)
        },
        onError: createErrorHandler(toast, '삭제 실패'),
      })
    }
  }

  const handleToggle = (job: ScheduleJob) => {
    toggleMutation.mutate(job.jobId, {
      onSuccess: (updatedJob) => {
        toast({
          title: updatedJob.isEnabled ? '활성화됨' : '비활성화됨',
          description: `${job.jobName} 스케줄이 ${updatedJob.isEnabled ? '활성화' : '비활성화'}되었습니다.`,
        })
      },
      onError: createErrorHandler(toast, '토글 실패'),
    })
  }

  const handleExecute = (job: ScheduleJob) => {
    executeMutation.mutate(job.jobId, {
      onSuccess: () => {
        toast({ title: '실행 요청 완료', description: `${job.jobName} 스케줄이 즉시 실행됩니다.` })
      },
      onError: createErrorHandler(toast, '실행 실패'),
    })
  }

  const handleRefresh = () => {
    refreshMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: '갱신 완료', description: '전체 스케줄이 갱신되었습니다.' })
      },
      onError: createErrorHandler(toast, '갱신 실패'),
    })
  }

  const handleViewHistory = (job: ScheduleJob) => {
    setHistoryJob(job)
  }

  return (
    <PageLayout
      actions={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>스케줄 갱신</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={openCreateForm} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>스케줄 추가</p>
            </TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <ContentCard noPadding>
        <div className="px-8 py-6">
          <SchedulerTable
            jobs={jobs}
            isLoading={isLoading}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onExecute={handleExecute}
            onViewHistory={handleViewHistory}
          />
        </div>
      </ContentCard>

      {/* Form Sheet */}
      <SchedulerForm
        mode={formMode}
        formData={formData}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />

      {/* Delete Dialog */}
      <SchedulerDeleteDialog
        job={deletingJob}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingJob(null)}
      />

      {/* History Dialog */}
      <SchedulerHistoryDialog
        job={historyJob}
        onClose={() => setHistoryJob(null)}
      />
    </PageLayout>
  )
}
