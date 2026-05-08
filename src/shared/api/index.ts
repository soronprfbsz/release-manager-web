/**
 * Shared API Public API
 */

// Client
export { apiClient } from './client'

// File Content API (통합)
export { fileContentApi, type FileContentResponse } from './fileContentApi'
export { fileContentKeys, useFileContentByPath } from './queries/fileContentQueries'

// File Download API (통합)
export { fileDownloadApi } from './fileDownloadApi'

// 서버 진행도 공용 API
export { progressApi } from './progress/progressApi'
export { useServerProgress } from './progress/queries'
export type { ProgressResponse } from './progress/types'

// Types
export type {
  ApiResponse,
  ApiError,
  PaginationParams,
} from './types'
