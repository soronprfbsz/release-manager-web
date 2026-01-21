/**
 * Release Entity Types
 * 릴리즈 도메인 타입 정의
 */

export interface DatabaseNode {
  databaseType: string
  files: string[]
}

/** 핫픽스 노드 (트리 응답용) */
export interface HotfixNode {
  versionId: number
  /** 핫픽스 버전 번호 */
  hotfixVersion: number
  /** 전체 버전 문자열 (e.g. 1.1.0.1) */
  fullVersion: string
  createdAt: string
  createdByName?: string
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  comment?: string
  isApproved?: boolean
  approvedBy?: string | null
  approvedByAvatarStyle?: string
  approvedByAvatarSeed?: string
  isDeletedApprover?: boolean
  approvedAt?: string | null
  /** 파일 카테고리 목록 (DATABASE, WEB, ENGINE, ETC) */
  fileCategories?: string[]
}

export interface VersionNode {
  versionId: number
  version: string
  createdAt: string
  createdByEmail: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  comment: string
  fileCategories: string[]
  isApproved: boolean
  approvedBy: string | null
  approvedAt: string | null
  /** 이 버전의 핫픽스 목록 */
  hotfixes: HotfixNode[]
}

export interface MajorMinorNode {
  majorMinor: string
  versions: VersionNode[]
}

export interface ReleaseTreeResponse {
  releaseType: string
  customerCode: string | null
  majorMinorGroups: MajorMinorNode[]
}

export interface ReleaseFileSimple {
  releaseFileId: number
  releaseVersion: string
  fileCategory: string
  subCategory: string
  fileName: string
  fileSize: number
  checksum: string
  executionOrder: number
  description: string | null
}

export interface ReleaseVersionDetail {
  releaseVersionId: number
  releaseType: string
  customerCode: string | null
  version: string
  majorVersion: number
  minorVersion: number
  patchVersion: number
  /** 핫픽스 버전 번호 (0이면 일반 버전) */
  hotfixVersion: number
  /** 전체 버전 문자열 (e.g. 1.3.2.1) */
  fullVersion: string
  majorMinor: string
  createdByEmail: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  comment: string
  customVersion: string | null
  isApproved: boolean
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
  releaseFiles: ReleaseFileSimple[]
}

/** 릴리즈 파일 트리 노드 */
export interface ReleaseFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size: number | null
  releaseFileId: number | null
  children: ReleaseFileNode[] | null
}

/** 릴리즈 파일 트리 구조 응답 */
export interface ReleaseFileStructure {
  releaseVersionId: number
  version: string
  files: ReleaseFileNode
}

/** 고객사별 커스텀 릴리즈 노드 */
export interface CustomerReleaseNode {
  customerId: number
  customerCode: string
  customerName: string
  customBaseVersionId: number | null
  customBaseVersion: string | null
  majorMinorGroups: MajorMinorNode[]
}

/** 전체 커스텀 릴리즈 트리 응답 */
export interface CustomReleaseTreeResponse {
  customers: CustomerReleaseNode[]
}

/** 표준본 버전 간단 정보 (셀렉트박스용) */
export interface StandardVersionSimple {
  versionId: number
  version: string
  isApproved: boolean
}

/** 릴리즈 파일 내용 응답 */
export interface ReleaseFileContent {
  releaseFileId: number
  path: string
  fileName: string
  size: number
  content: string
  mimeType?: string      // 파일의 MIME 타입
  isBinary?: boolean     // true면 content가 Base64 인코딩됨
}
