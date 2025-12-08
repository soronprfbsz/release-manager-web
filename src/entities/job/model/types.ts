/**
 * Job Entity Types
 * 작업 도메인 타입 정의
 */

/**
 * 백업 파일 목록 응답 (BackupFileDto.ListResponse)
 */
export interface BackupFile {
  rowNumber: number
  backupFileId: number
  fileCategory: string
  fileType: string
  fileName: string
  fileSize: number
  fileSizeFormatted: string
  description: string | null
  createdBy: string
  createdAt: string
}

/**
 * 백업 파일 검색 조건
 */
export interface BackupFileSearchParams {
  fileCategory?: string
  fileType?: string
  fileName?: string
  page?: number
  size?: number
}

/**
 * 작업 상태 응답 (JobResponse)
 */
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

/**
 * MariaDB 백업 요청 (MariaDBBackupRequest)
 */
export interface MariaDBBackupRequest {
  host: string
  port: number
  username: string
  password: string
  database: string
  fileName?: string
  description?: string
}

/**
 * MariaDB 복원 요청 (MariaDBRestoreRequest)
 */
export interface MariaDBRestoreRequest {
  host: string
  port: number
  username: string
  password: string
  backupFileId: number
}

/**
 * 로그 파일 정보
 */
export interface LogFile {
  logFileName: string
  logType: 'BACKUP' | 'RESTORE'
  fileSize: number
  fileSizeFormatted: string
  lastModified: string
}

/**
 * 백업 파일 로그 목록 응답
 */
export interface BackupFileLogsResponse {
  backupFileId: number
  backupFileName: string
  logFiles: LogFile[]
}

/**
 * 페이징 응답
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
