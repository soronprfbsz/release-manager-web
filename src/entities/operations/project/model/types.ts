/**
 * Project Entity Types
 * 프로젝트 도메인 타입 정의
 */

export interface Project {
  projectId: string
  projectName: string
  description: string | null
  isEnabled: boolean
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateRequest {
  projectId: string
  projectName: string
  description?: string
  isEnabled?: boolean
}

export interface ProjectUpdateRequest {
  projectName?: string
  description?: string
  isEnabled?: boolean
}

/** 기본 프로젝트 ID */
export const DEFAULT_PROJECT_ID = 'infraeye2'

/** 온보딩 파일 노드 (트리 구조) */
export interface OnboardingFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number
  children?: OnboardingFileNode[]
}

/** 온보딩 파일 응답 */
export interface OnboardingFilesResponse {
  projectId: string
  projectName: string
  hasFiles: boolean
  totalFileCount: number
  totalSize: number
  files: OnboardingFileNode
}

/** 온보딩 파일 내용 응답 */
export interface OnboardingFileContent {
  content: string
  mimeType: string
  isBinary: boolean
}

/** 온보딩 파일 삭제 응답 */
export interface OnboardingFileDeleteResponse {
  projectId: string
  deletedPath: string
  message: string
}

/** 온보딩 파일 업로드 응답 */
export interface OnboardingFileUploadResponse {
  projectId: string
  uploadedPath: string
  message: string
}

/** 온보딩 디렉토리 생성 응답 */
export interface OnboardingDirectoryCreateResponse {
  projectId: string
  createdPath: string
  message: string
}

// ============================================================================
// Install (인스톨) 관련 타입
// ============================================================================

/** 인스톨 파일 노드 (트리 구조) */
export interface InstallFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number
  children?: InstallFileNode[]
}

/** 인스톨 파일 응답 */
export interface InstallFilesResponse {
  projectId: string
  projectName: string
  hasFiles: boolean
  totalFileCount: number
  totalSize: number
  files: InstallFileNode
}

/** 인스톨 파일 삭제 응답 */
export interface InstallFileDeleteResponse {
  projectId: string
  deletedPath: string
  message: string
}

/** 인스톨 파일 업로드 응답 */
export interface InstallFileUploadResponse {
  projectId: string
  uploadedPath: string
  message: string
}

/** 인스톨 디렉토리 생성 응답 */
export interface InstallDirectoryCreateResponse {
  projectId: string
  createdPath: string
  message: string
}
