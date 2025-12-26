/**
 * MariaDB Query Keys and Hooks
 * MariaDB 관련 React Query 키 팩토리 및 훅
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { mariadbApi } from '../api/mariadbApi'
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

export const mariadbKeys = {
  all: ['mariadb'] as const,
  backupFiles: (params?: BackupFileSearchParams) => [...mariadbKeys.all, 'backup-files', params] as const,
  backupFileLogs: (id: number) => [...mariadbKeys.all, 'backup-file-logs', id] as const,
  backupJobStatus: (jobId: string) => [...mariadbKeys.all, 'backup-job-status', jobId] as const,
  restoreJobStatus: (jobId: string) => [...mariadbKeys.all, 'restore-job-status', jobId] as const,
  backupFileContent: (id: number) => [...mariadbKeys.all, 'backup-file-content', id] as const,
  logFileContent: (backupFileId: number, logFileName: string) =>
    [...mariadbKeys.all, 'log-file-content', backupFileId, logFileName] as const,
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
    queryKey: mariadbKeys.backupFiles(params),
    queryFn: () => mariadbApi.getBackupFiles(params),
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
    queryKey: mariadbKeys.backupFileLogs(id),
    queryFn: () => mariadbApi.getBackupFileLogs(id),
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
    queryKey: mariadbKeys.backupJobStatus(jobId),
    queryFn: () => mariadbApi.getBackupJobStatus(jobId),
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
    queryKey: mariadbKeys.restoreJobStatus(jobId),
    queryFn: () => mariadbApi.getRestoreJobStatus(jobId),
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
    queryKey: mariadbKeys.backupFileContent(id),
    queryFn: () => mariadbApi.getBackupFileContent(id),
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
    queryKey: mariadbKeys.logFileContent(backupFileId, logFileName),
    queryFn: () => mariadbApi.getLogFileContent(backupFileId, logFileName),
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
    mutationFn: (request: MariaDBBackupRequest) => mariadbApi.backupMariaDB(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mariadbKeys.all })
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
    mutationFn: (request: MariaDBRestoreRequest) => mariadbApi.restoreMariaDB(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mariadbKeys.all })
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
    mutationFn: (id: number) => mariadbApi.deleteBackupFile(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: mariadbKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}
