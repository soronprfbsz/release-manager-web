/**
 * Release Entity Types
 * 릴리즈 도메인 타입 정의
 */

export interface DatabaseNode {
  databaseType: string
  files: string[]
}

/** 빌드 항목 (백엔드 BuildItem 대응) */
export interface BuildItem {
  buildVersionId: number
  /** 빌드 버전 번호 (예: 260427) */
  buildVersion: number
  /** 기준 버전 (예: 1.1.0) */
  version: string
  /** 전체 버전 (예: 1.1.0.260427) */
  fullVersion: string
  isApproved: boolean
  createdAt: string
  createdByEmail?: string | null
  createdByName?: string | null
  comment?: string | null
}

/** 빌드 목록 응답 (백엔드 BuildListResponse 대응) */
export interface BuildListResponse {
  releaseVersionId: number
  version: string
  builds: BuildItem[]
}

/** 빌드 생성 응답 (백엔드 CreateBuildResponse 대응) */
export interface CreateBuildResponse {
  buildVersionId: number
  version: string
  buildVersion: number
  fullVersion: string
  /** 업로드된 파일 개수 (ZIP 미동봉 시 0) */
  uploadedFileCount: number
}

/** 빌드 노드 (트리 응답용 - 트리에서 base 버전 하위에 표시) */
export interface BuildTreeNode {
  versionId: number
  /** 빌드 버전 번호 (예: 260427) */
  buildVersion: number
  /** 전체 버전 (예: 1.1.0.260427) */
  fullVersion: string
  createdAt: string
  createdByName?: string | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  comment?: string
  /** 빌드는 항상 true */
  isApproved: boolean
  /** 파일 카테고리 (보통 WEB, ENGINE, ETC) */
  fileCategories?: string[]
}

/** 핫픽스 노드 (트리 응답용) */
export interface HotfixNode {
  versionId: number
  /** 핫픽스 버전 번호 */
  hotfixVersion: number
  /** 전체 버전 문자열 (e.g. 1.1.0.1) */
  fullVersion: string
  createdAt: string
  createdByName?: string | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  comment?: string
  isApproved?: boolean
  approvedBy?: string | null
  approvedByName?: string | null
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
  createdByName?: string | null
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  comment: string
  fileCategories: string[]
  isApproved: boolean
  approvedBy: string | null
  approvedByName?: string | null
  approvedByAvatarStyle?: string
  approvedByAvatarSeed?: string
  isDeletedApprover?: boolean
  approvedAt: string | null
  /** 이 버전의 핫픽스 목록 */
  hotfixes: HotfixNode[]
  /** 이 버전의 빌드 목록 (build_version DESC) */
  builds?: BuildTreeNode[]
}

export interface MajorMinorNode {
  majorMinor: string
  versions: VersionNode[]
}

export interface ReleaseTreeResponse {
  releaseType: string
  siteCode: string | null
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
  siteCode: string | null
  version: string
  majorVersion: number
  minorVersion: number
  patchVersion: number
  /** 핫픽스 버전 번호 (0이면 일반 버전) */
  hotfixVersion: number
  /** 핫픽스 여부 (백엔드 DetailResponse 의 isHotfix) */
  isHotfix?: boolean
  /** 빌드 버전 번호 (0이면 일반/핫픽스, 1+이면 빌드, 예: 260427) */
  buildVersion?: number
  /** 빌드 여부 */
  isBuild?: boolean
  /** 전체 버전 문자열 (e.g. 1.3.2.1 또는 1.1.0.260427) */
  fullVersion: string
  majorMinor: string
  createdByEmail: string
  createdByName?: string | null
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  comment: string
  customVersion: string | null
  isApproved: boolean
  approvedBy: string | null
  approvedByName?: string | null
  approvedByAvatarStyle?: string
  approvedByAvatarSeed?: string
  isDeletedApprover?: boolean
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

/** 사이트별 커스텀 릴리즈 노드 */
export interface SiteReleaseNode {
  siteId: number
  siteCode: string
  siteName: string
  customBaseVersionId: number | null
  customBaseVersion: string | null
  majorMinorGroups: MajorMinorNode[]
}

/** 전체 커스텀 릴리즈 트리 응답 */
export interface CustomReleaseTreeResponse {
  sites: SiteReleaseNode[]
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

// ---- builds-in-range API ----

export interface BuildCandidate {
  buildVersionId: number
  fullVersion: string
  createdAt: string
  isLatest: boolean
}

export interface EngineGroup {
  engineName: string
  candidates: BuildCandidate[]
}

export interface HotfixInRangeInfo {
  versionId: number
  fullVersion: string
  hotfixVersion: number
}

export interface BuildsInRangeResponse {
  web: BuildCandidate[]
  engines: EngineGroup[]
  hotfixesInRange: HotfixInRangeInfo[]
}
