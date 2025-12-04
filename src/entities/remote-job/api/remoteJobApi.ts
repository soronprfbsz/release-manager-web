import { apiClient } from '@/shared/api/client'
import type {
  BackupFile,
  JobStatus,
  MariaDBBackupRequest,
  MariaDBRestoreRequest,
  AsyncJobResponse,
  BackupListResponse,
} from '../model/types'

const ENDPOINTS = {
  mariadbRestoreAsync: '/api/remote/mariadb-restore/async',
  mariadbBackupAsync: '/api/remote/mariadb-backup/async',
  backupList: '/api/remote/mariadb-backup/list',
  backupDownload: (fileName: string) => `/api/remote/mariadb-backup/download/${encodeURIComponent(fileName)}`,
  jobStatus: (jobId: string) => `/api/remote/job-status/${encodeURIComponent(jobId)}`,
  backupDelete: (fileName: string) => `/api/remote/mariadb-backup/${encodeURIComponent(fileName)}`,
} as const

export const remoteJobApi = {
  /** MariaDB 원격 복원 (비동기) */
  restoreMariaDB: async (request: MariaDBRestoreRequest): Promise<AsyncJobResponse> => {
    const response = await apiClient.post<AsyncJobResponse>(ENDPOINTS.mariadbRestoreAsync, request)
    return response
  },

  /** MariaDB 원격 백업 (비동기) */
  backupMariaDB: async (request: MariaDBBackupRequest): Promise<AsyncJobResponse> => {
    const response = await apiClient.post<AsyncJobResponse>(ENDPOINTS.mariadbBackupAsync, request)
    return response
  },

  /** 백업 파일 목록 조회 */
  getBackupList: async (): Promise<BackupFile[]> => {
    const response = await apiClient.get<BackupListResponse>(ENDPOINTS.backupList)
    return response?.files || []
  },

  /** 백업 파일 다운로드 */
  downloadBackup: async (fileName: string): Promise<void> => {
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL}${ENDPOINTS.backupDownload(fileName)}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /** 작업 상태 조회 */
  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await apiClient.get<JobStatus>(ENDPOINTS.jobStatus(jobId))
    return response
  },

  /** 백업 파일 삭제 */
  deleteBackup: async (fileName: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.backupDelete(fileName))
  },
}
