/**
 * Patch Entity Types
 * 패치 도메인 타입 정의
 */

export interface IncludedWeb {
  buildVersionId: number | null
  fullVersion: string
}

export interface IncludedEngine {
  engineName: string
  buildVersionId: number | null
  fullVersion: string
}

export interface IncludedBuilds {
  web: IncludedWeb | null
  engines: IncludedEngine[]
}

export interface PatchHotfixInRangeInfo {
  versionId: number | null
  fullVersion: string
}

export interface CumulativePatch {
  rowNumber: number
  patchId: number
  /** 패치 이력 API에서 반환되는 고유 ID (historyId) */
  historyId?: number
  releaseType: string
  customerCode: string | null
  customerName: string | null
  fromVersion: string
  toVersion: string
  patchName: string
  createdByEmail: string
  createdByName?: string | null
  createdByAvatarStyle?: string | null
  createdByAvatarSeed?: string | null
  isDeletedCreator?: boolean
  description: string | null
  assigneeId: number | null
  assigneeName: string | null
  assigneeEmail: string | null
  assigneeAvatarStyle?: string | null
  assigneeAvatarSeed?: string | null
  isDeletedAssignee?: boolean
  createdAt: string
  isBuildOnly?: boolean | null
  isBuildIncluded?: boolean | null
  includedBuildsSummary?: string | null
  /** 패치 완료(적용) 일시 — 패치 이력 API 에서만 포함 */
  completedAt?: string | null
  /** 패치 완료 처리자 계정 식별자 — 패치 이력 API 에서만 포함 */
  completedBy?: string | null
}

export interface CumulativePatchDetail {
  patchId: number
  releaseType: string
  customerCode: string | null
  customerName: string | null
  fromVersion: string
  toVersion: string
  patchName: string
  outputPath: string
  createdByEmail: string
  createdByName?: string | null
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  isDeletedCreator?: boolean
  description: string | null
  assigneeId: number | null
  assigneeName: string | null
  assigneeEmail: string | null
  assigneeAvatarStyle?: string | null
  assigneeAvatarSeed?: string | null
  isDeletedAssignee?: boolean
  createdAt: string
  updatedAt: string
  isBuildOnly?: boolean | null
  isBuildIncluded?: boolean | null
  includedBuilds?: IncludedBuilds | null
  hotfixesInRange?: PatchHotfixInRangeInfo[] | null
}

export interface SelectedWeb {
  buildVersionId: number
}

export interface SelectedEngine {
  engineName: string
  buildVersionId: number
}

export interface BuildSelection {
  enabled: boolean
  web: SelectedWeb | null
  engines: SelectedEngine[]
}

export interface CumulativePatchGenerateRequest {
  projectId: string
  type: 'standard' | 'custom'
  customerId?: number
  fromVersion: string
  toVersion: string
  createdByEmail: string
  assigneeId?: number
  description?: string
  patchName?: string
  buildSelection?: BuildSelection | null
}

export interface GenerateResponse {
  patchId: number
  patchName: string
  outputPath: string
  isBuildOnly: boolean
  hotfixesInRange: PatchHotfixInRangeInfo[]
  includedBuilds: IncludedBuilds
}

/** 커스텀 패치 생성 요청 (신규 API) */
export interface CustomPatchGenerateRequest {
  projectId: string
  customerId: number
  fromVersion: string
  toVersion: string
  createdByEmail: string
  description?: string
  assigneeId?: number
  patchName?: string
  /** 빌드 파일 선택 (null 또는 enabled=false 면 미포함) */
  buildSelection?: BuildSelection | null
}

/** 커스텀 버전 보유 고객사 */
export interface CustomPatchCustomer {
  customerId: number
  customerCode: string
  customerName: string
}

/** 고객사별 커스텀 버전 */
export interface CustomPatchVersion {
  versionId: number
  version: string
  isApproved: boolean
  isBaseVersion: boolean
}

export interface PatchFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number
  children?: PatchFileNode[]
}

export interface PatchFileStructure {
  patchId: number
  patchName: string
  root: PatchFileNode
}

export interface PatchFileContent {
  patchId: number
  path: string
  fileName: string
  size: number
  content: string
  mimeType?: string      // 파일의 MIME 타입
  isBinary?: boolean     // true면 content가 Base64 인코딩됨
}
