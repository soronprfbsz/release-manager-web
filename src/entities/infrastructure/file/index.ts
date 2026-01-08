/**
 * File Entity
 * 파일 엔티티 모듈
 */

// API
export { fileApi } from './api/fileApi'
// Backward compatibility
export { fileApi as resourceApi } from './api/fileApi'

// Types
export type {
  File,
  FileUploadRequest,
  FileUpdateRequest,
  FileContent,
} from './model/types'

// Type aliases for backward compatibility
export type { File as ResourceFile } from './model/types'
export type { FileUploadRequest as ResourceFileUploadRequest } from './model/types'
export type { FileUpdateRequest as ResourceFileUpdateRequest } from './model/types'
export type { FileContent as ResourceFileContent } from './model/types'

// Queries
export {
  fileKeys,
  useFiles,
  useFile,
  useFileContent,
  useUploadFile,
  useUpdateFile,
  useDeleteFile,
  useReorderFiles,
} from './queries/fileQueries'

// Query aliases for backward compatibility
export { fileKeys as resourceKeys } from './queries/fileQueries'
export { useFiles as useResources } from './queries/fileQueries'
export { useFile as useResource } from './queries/fileQueries'
export { useFileContent as useResourceFileContent } from './queries/fileQueries'
export { useUploadFile as useUploadResource } from './queries/fileQueries'
export { useUpdateFile as useUpdateResource } from './queries/fileQueries'
export { useDeleteFile as useDeleteResource } from './queries/fileQueries'
export { useReorderFiles as useReorderResources } from './queries/fileQueries'

