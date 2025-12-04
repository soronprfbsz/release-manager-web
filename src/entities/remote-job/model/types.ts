/**
 * Remote Job Entity Types
 * 원격 작업 도메인 타입 정의
 */

export interface BackupFile {
  fileName: string
  size: number
  createdAt: string
  downloadUrl?: string
}

export interface JobStatus {
  jobId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress?: number
  message?: string
  startTime?: string
  endTime?: string
  errorMessage?: string
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
