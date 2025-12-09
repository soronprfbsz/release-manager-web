/**
 * Job Query Keys and Hooks
 * Job 관련 React Query 키 팩토리 및 훅
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { jobApi } from '../api/jobApi'
import type {
  BackupFile,
  BackupFileSearchParams,
  BackupFileLogsResponse,
  JobStatus,
  MariaDBBackupRequest,
  MariaDBRestoreRequest,
  PageResponse,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const jobKeys = {
  all: ['job'] as const,
  backupFiles: (params?: BackupFileSearchParams) => [...jobKeys.all, 'backup-files', params] as const,
  backupFileLogs: (id: number) => [...jobKeys.all, 'backup-file-logs', id] as const,
  backupJobStatus: (jobId: string) => [...jobKeys.all, 'backup-job-status', jobId] as const,
  restoreJobStatus: (jobId: string) => [...jobKeys.all, 'restore-job-status', jobId] as const,
  backupFileContent: (id: number) => [...jobKeys.all, 'backup-file-content', id] as const,
  logFileContent: (backupFileId: number, logFileName: string) =>
    [...jobKeys.all, 'log-file-content', backupFileId, logFileName] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 백업 파일 목록 조회 훅 (페이징, 검색)
 */
export function useBackupFiles(
  params?: BackupFileSearchParams,
  options?: Omit<UseQueryOptions<PageResponse<BackupFile>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.backupFiles(params),
    queryFn: () => jobApi.getBackupFiles(params),
    ...options,
  })
}

/**
 * 백업 파일 로그 목록 조회 훅
 */
export function useBackupFileLogs(
  id: number,
  options?: Omit<UseQueryOptions<BackupFileLogsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.backupFileLogs(id),
    queryFn: () => jobApi.getBackupFileLogs(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * 백업 작업 상태 조회 훅
 */
export function useBackupJobStatus(
  jobId: string,
  options?: Omit<UseQueryOptions<JobStatus, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.backupJobStatus(jobId),
    queryFn: () => jobApi.getBackupJobStatus(jobId),
    enabled: !!jobId,
    ...options,
  })
}

/**
 * 복원 작업 상태 조회 훅
 */
export function useRestoreJobStatus(
  jobId: string,
  options?: Omit<UseQueryOptions<JobStatus, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.restoreJobStatus(jobId),
    queryFn: () => jobApi.getRestoreJobStatus(jobId),
    enabled: !!jobId,
    ...options,
  })
}

/**
 * 백업 파일 내용 조회 훅
 */
export function useBackupFileContent(
  id: number,
  options?: Omit<UseQueryOptions<{ content: string }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.backupFileContent(id),
    queryFn: () => jobApi.getBackupFileContent(id),
    enabled: !!id,
    staleTime: Infinity, // 파일 내용은 변경되지 않음
    ...options,
  })
}

/**
 * 로그 파일 내용 조회 훅
 */
export function useLogFileContent(
  backupFileId: number,
  logFileName: string,
  options?: Omit<UseQueryOptions<{ content: string }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: jobKeys.logFileContent(backupFileId, logFileName),
    queryFn: () => jobApi.getLogFileContent(backupFileId, logFileName),
    enabled: !!backupFileId && !!logFileName,
    staleTime: Infinity, // 로그 파일 내용은 변경되지 않음
    ...options,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * MariaDB 백업 실행 훅
 */
export function useBackupMariaDB(
  options?: UseMutationOptions<JobStatus, Error, MariaDBBackupRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: MariaDBBackupRequest) => jobApi.backupMariaDB(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all })
    },
    ...options,
  })
}

/**
 * MariaDB 복원 실행 훅
 */
export function useRestoreMariaDB(
  options?: UseMutationOptions<JobStatus, Error, MariaDBRestoreRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: MariaDBRestoreRequest) => jobApi.restoreMariaDB(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all })
    },
    ...options,
  })
}

/**
 * 백업 파일 삭제 훅
 */
export function useDeleteBackupFile(options?: UseMutationOptions<void, Error, number>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => jobApi.deleteBackupFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all })
    },
    ...options,
  })
}
