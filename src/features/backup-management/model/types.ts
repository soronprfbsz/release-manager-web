/**
 * Backup Management Feature Types
 * 백업 관리 기능 타입 정의
 */

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface LogViewerState {
  backupFileId: number
  logFileName: string
  fileSize: number
}
