/**
 * File Entity Types
 * 파일 도메인 타입 정의
 */

/** 파일 정보 */
export interface File {
  resourceFileId: number
  fileType: string
  fileCategory: string
  subCategory: string | null
  resourceFileName: string
  fileName: string
  filePath: string
  fileSize: number
  description: string | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  createdAt: string
}

/** 파일 업로드 요청 */
export interface FileUploadRequest {
  file: globalThis.File
  fileCategory: string
  subCategory?: string
  resourceFileName: string
  description?: string
}

/** 파일 수정 요청 */
export interface FileUpdateRequest {
  fileCategory: string
  subCategory?: string
  resourceFileName: string
  description?: string
}

/** 파일 내용 */
export interface FileContent {
  resourceFileId: number
  path: string
  fileName: string
  size: number
  mimeType?: string
  isBinary?: boolean
  content: string
}

// ============================================================================
// Resource File Tree (카테고리별 파일 트리) 관련 타입
// ============================================================================

/** 카테고리 정보 (목록 조회용) */
export interface ResourceCategoryInfo {
  category: string
  categoryName: string
  fileCount: number
  totalSize: number
}

/** 카테고리 목록 응답 (GET /api/resources/categories) */
export interface ResourceCategoriesResponse {
  categoryCount: number
  categories: ResourceCategoryInfo[]
}

/** 리소스 파일 노드 (트리 구조) */
export interface ResourceFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number
  children?: ResourceFileNode[]
}

/** 카테고리별 파일 트리 응답 (GET /api/resources/{category}/files) */
export interface ResourceCategoryFilesResponse {
  category: string
  categoryName: string
  hasFiles: boolean
  totalFileCount: number
  totalSize: number
  files: ResourceFileNode
}

/** @deprecated Use ResourceCategoryFilesResponse instead */
export interface ResourceCategoryFiles {
  category: string
  categoryName: string
  hasFiles: boolean
  totalFileCount: number
  totalSize: number
  files: ResourceFileNode
}

/** @deprecated Use ResourceCategoryInfo[] instead */
export interface ResourceFilesResponse {
  categories: ResourceCategoryFiles[]
  totalFileCount: number
  totalSize: number
}

/** 리소스 파일 삭제 응답 */
export interface ResourceFileDeleteResponse {
  category: string
  deletedPath: string
  message: string
}

/** 리소스 파일 업로드 응답 */
export interface ResourceFileUploadResponse {
  category: string
  uploadedPath: string
  message: string
}

/** 리소스 디렉토리 생성 응답 */
export interface ResourceDirectoryCreateResponse {
  category: string
  createdPath: string
  message: string
}

/** 카테고리 생성 요청 */
export interface ResourceCategoryCreateRequest {
  categoryName: string
}

/** 카테고리 생성 응답 */
export interface ResourceCategoryCreateResponse {
  category: string
  message: string
}

/** 카테고리 삭제 응답 */
export interface ResourceCategoryDeleteResponse {
  category: string
  message: string
}

