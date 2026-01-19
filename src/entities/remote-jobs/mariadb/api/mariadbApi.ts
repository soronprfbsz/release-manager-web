import { apiClient } from '@/shared/api/client'
import { downloadWithProgress, type DownloadProgressEvent } from '@/shared/lib/utils/download-helper'

import type {
  BackupFile,
  BackupFileSearchParams,
  BackupFileLogsResponse,
  JobStatus,
  MariaDBBackupRequest,
  MariaDBRestoreRequest,
  PageResponse,
} from '../model/types'

const ENDPOINTS = {
  // MariaDB 백업
  mariadbBackup: '/api/jobs/mariadb-backup',
  mariadbBackupJobStatus: (id: string) => `/api/jobs/mariadb-backup/job-status/${encodeURIComponent(id)}`,
  // MariaDB 복원
  mariadbRestore: '/api/jobs/mariadb-restore',
  mariadbRestoreJobStatus: (id: string) => `/api/jobs/mariadb-restore/job-status/${encodeURIComponent(id)}`,
  // 백업 파일 관리
  backupFiles: '/api/jobs/backup-files',
  backupFileDownload: (id: number) => `/api/jobs/backup-files/${id}/download`,
  backupFileDelete: (id: number) => `/api/jobs/backup-files/${id}`,
  // 로그 관리
  backupFileLogs: (id: number) => `/api/jobs/backup-files/${id}/logs`,
  backupFileLogDownload: (id: number, logFileName: string) =>
    `/api/jobs/backup-files/${id}/logs/download?logFileName=${encodeURIComponent(logFileName)}`,
} as const

export const mariadbApi = {
  /** MariaDB 백업 실행 (비동기) */
  backupMariaDB: async (request: MariaDBBackupRequest): Promise<JobStatus> => {
    const response = await apiClient.post<JobStatus>(ENDPOINTS.mariadbBackup, request)
    return response
  },

  /** 백업 작업 상태 조회 */
  getBackupJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await apiClient.get<JobStatus>(ENDPOINTS.mariadbBackupJobStatus(jobId))
    return response
  },

  /** MariaDB 복원 실행 (비동기) */
  restoreMariaDB: async (request: MariaDBRestoreRequest): Promise<JobStatus> => {
    const response = await apiClient.post<JobStatus>(ENDPOINTS.mariadbRestore, request)
    return response
  },

  /** 복원 작업 상태 조회 */
  getRestoreJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await apiClient.get<JobStatus>(ENDPOINTS.mariadbRestoreJobStatus(jobId))
    return response
  },

  /** 백업 파일 목록 조회 (페이징, 검색) */
  getBackupFiles: async (params?: BackupFileSearchParams): Promise<PageResponse<BackupFile>> => {
    const queryParams = new URLSearchParams()
    if (params?.fileCategory) queryParams.append('fileCategory', params.fileCategory)
    if (params?.fileType) queryParams.append('fileType', params.fileType)
    if (params?.fileName) queryParams.append('fileName', params.fileName)
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())

    const url = queryParams.toString()
      ? `${ENDPOINTS.backupFiles}?${queryParams.toString()}`
      : ENDPOINTS.backupFiles

    const response = await apiClient.get<PageResponse<BackupFile>>(url)
    return response
  },

  /** 백업 파일 다운로드 - 진행률 지원 */
  downloadBackupFile: async (
    id: number,
    fileName: string,
    onProgress?: (event: DownloadProgressEvent) => void
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.backupFileDownload(id),
      filename: fileName,
      onProgress,
    })
  },

  /** 백업 파일 삭제 */
  deleteBackupFile: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.backupFileDelete(id))
  },

  /** 백업 파일 내용 조회 (다운로드 API를 통해 텍스트로 읽기) */
  getBackupFileContent: async (id: number): Promise<{ content: string }> => {
    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.backupFileDownload(id), {
      responseType: 'text',
    })
    return { content: response.data }
  },

  /** 백업 파일 로그 목록 조회 */
  getBackupFileLogs: async (id: number): Promise<BackupFileLogsResponse> => {
    const response = await apiClient.get<BackupFileLogsResponse>(ENDPOINTS.backupFileLogs(id))
    return response
  },

  /** 로그 파일 다운로드 - 진행률 지원 */
  downloadLogFile: async (
    backupFileId: number,
    logFileName: string,
    onProgress?: (event: DownloadProgressEvent) => void
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.backupFileLogDownload(backupFileId, logFileName),
      filename: logFileName,
      onProgress,
    })
  },

  /** 로그 파일 내용 조회 */
  getLogFileContent: async (backupFileId: number, logFileName: string): Promise<{ content: string }> => {
    const response = await apiClient.getAxiosInstance().get(
      ENDPOINTS.backupFileLogDownload(backupFileId, logFileName),
      { responseType: 'text' }
    )
    return { content: response.data }
  },
}
