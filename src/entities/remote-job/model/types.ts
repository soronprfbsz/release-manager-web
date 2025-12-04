/**
 * Remote Job Entity Types
 * 원격 작업 도메인 타입 정의
 */

export interface BackupFile {
  fileName: string
  fileSizeBytes: number
  createdAt: string
  host: string | null
}

export interface JobStatus {
  jobId: string
  status: 'RUNNING' | 'SUCCESS' | 'FAILED'
  startTime: string | null
  endTime: string | null
  message: string | null
  fileName: string | null
  fileSize: number | null
  logFile: string | null
  errorMessage: string | null
}

export interface MariaDBBackupRequest {
  host: string
  port: number
  database: string
  username: string
  password: string
  outputFileName?: string
}

export interface MariaDBRestoreRequest {
  host: string
  port: number
  database: string
  username: string
  password: string
  backupFileName: string
}

export interface AsyncJobResponse {
  jobId: string
  message: string
}

export interface BackupListResponse {
  files?: BackupFile[]
  totalCount?: number
}
