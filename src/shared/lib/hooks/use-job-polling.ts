import { useRef, useCallback } from 'react'

import { mariadbApi, type JobStatus } from '@/entities/remote-jobs/mariadb'

import { toast } from './use-toast'

/** 파일 크기 포맷팅 */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

interface JobPollingOptions {
  /** polling 간격 (ms), 기본값 3000ms */
  interval?: number
  /** 최대 polling 시도 횟수, 기본값 무제한 */
  maxAttempts?: number
  /** 완료 시 콜백 */
  onComplete?: (status: JobStatus) => void
  /** 실패 시 콜백 */
  onFailed?: (status: JobStatus) => void
  /** 상태 변경 시 콜백 */
  onStatusChange?: (status: JobStatus) => void
  /** 작업 타입 (토스트 메시지용) */
  jobType?: '백업' | '복원'
}

/** 전역 polling 상태 관리 */
class JobPollingManager {
  private activeJobs = new Map<string, {
    intervalId: ReturnType<typeof setInterval>
    attempts: number
    options: JobPollingOptions
    toastRef: { dismiss: () => void; update: (props: any) => void } | null
  }>()
  private listeners = new Set<() => void>()

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener())
  }

  getActiveJobs(): string[] {
    return Array.from(this.activeJobs.keys())
  }

  isPolling(jobId: string): boolean {
    return this.activeJobs.has(jobId)
  }

  startPolling(
    jobId: string,
    options: JobPollingOptions
  ) {
    if (this.activeJobs.has(jobId)) {
      return // 이미 polling 중
    }

    const { interval = 3000, maxAttempts, jobType = '작업' } = options
    let attempts = 0

    // 진행 중 toast 생성 (무한 지속)
    const toastRef = toast({
      title: `${jobType} 진행 중`,
      description: `${jobType} 작업을 처리하고 있습니다...`,
      duration: Infinity,
    })

    const poll = async () => {
      attempts++

      try {
        // jobId에 따라 적절한 API 호출
        const isBackupJob = jobId.startsWith('backup_')
        const status = isBackupJob
          ? await mariadbApi.getBackupJobStatus(jobId)
          : await mariadbApi.getRestoreJobStatus(jobId)
        options.onStatusChange?.(status)

        if (status.status === 'SUCCESS') {
          this.stopPolling(jobId)
          const fileSizeStr = status.fileSize ? ` (${formatFileSize(status.fileSize)})` : ''
          const fileNameStr = status.fileName ? `${status.fileName}${fileSizeStr}` : ''

          // 완료 toast 표시
          toast({
            title: `${jobType} 완료`,
            description: fileNameStr || status.message || `${jobType}이 성공적으로 완료되었습니다.`,
          })
          options.onComplete?.(status)
        } else if (status.status === 'FAILED') {
          this.stopPolling(jobId)

          // 실패 toast 표시
          toast({
            title: `${jobType} 실패`,
            description: status.errorMessage || `${jobType} 중 오류가 발생했습니다.`,
            variant: 'destructive',
          })
          options.onFailed?.(status)
        } else if (maxAttempts && attempts >= maxAttempts) {
          this.stopPolling(jobId)

          toast({
            title: `${jobType} 상태 확인 중단`,
            description: '최대 시도 횟수를 초과했습니다. 작업은 백그라운드에서 계속 진행됩니다.',
            variant: 'destructive',
          })
        }
        // RUNNING 상태는 계속 polling
      } catch (error) {
        console.error(`Job polling error for ${jobId}:`, error)
        // 네트워크 오류 등은 무시하고 계속 polling
      }
    }

    // 즉시 첫 번째 poll 실행
    poll()

    const intervalId = setInterval(poll, interval)
    this.activeJobs.set(jobId, { intervalId, attempts, options, toastRef })
    this.notify()
  }

  stopPolling(jobId: string) {
    const job = this.activeJobs.get(jobId)
    if (job) {
      clearInterval(job.intervalId)
      // 진행 중 toast 닫기
      job.toastRef?.dismiss()
      this.activeJobs.delete(jobId)
      this.notify()
    }
  }

  stopAll() {
    this.activeJobs.forEach((job) => {
      clearInterval(job.intervalId)
      job.toastRef?.dismiss()
    })
    this.activeJobs.clear()
    this.notify()
  }
}

export const jobPollingManager = new JobPollingManager()

/**
 * Job 상태 polling 훅
 * - 비동기 작업(백업/복원) 완료 여부를 주기적으로 확인
 * - 페이지 이동해도 polling 유지 (전역 상태)
 * - 진행 중 toast가 유지되고, 완료/실패 시 결과 toast로 교체
 */
export function useJobPolling(options: JobPollingOptions = {}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const startPolling = useCallback((jobId: string, jobType: '백업' | '복원' = '백업') => {
    jobPollingManager.startPolling(
      jobId,
      { ...optionsRef.current, jobType }
    )
  }, [])

  const stopPolling = useCallback((jobId: string) => {
    jobPollingManager.stopPolling(jobId)
  }, [])

  const isPolling = useCallback((jobId: string) => {
    return jobPollingManager.isPolling(jobId)
  }, [])

  return {
    startPolling,
    stopPolling,
    isPolling,
  }
}
