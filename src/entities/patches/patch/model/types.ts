/**
 * Patch Entity Types
 * 패치 도메인 타입 정의
 */

export interface CumulativePatch {
  rowNumber: number
  patchId: number
  releaseType: string
  customerCode: string | null
  customerName: string | null
  fromVersion: string
  toVersion: string
  patchName: string
  createdByEmail: string
  createdByAvatarStyle?: string | null
  createdByAvatarSeed?: string | null
  isDeletedCreator?: boolean
  description: string | null
  engineerId: number | null
  engineerName: string | null
  createdAt: string
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
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  description: string | null
  engineerId: number | null
  engineerName: string | null
  createdAt: string
  updatedAt: string
}

export interface CumulativePatchGenerateRequest {
  projectId: string
  type: 'standard' | 'custom'
  customerId?: number
  fromVersion: string
  toVersion: string
  createdByEmail: string
  engineerId?: number
  description?: string
  patchName?: string
  includeAllBuildVersions?: boolean
}

/** 커스텀 패치 생성 요청 (신규 API) */
export interface CustomPatchGenerateRequest {
  projectId: string
  customerId: number
  fromVersion: string
  toVersion: string
  createdByEmail: string
  description?: string
  engineerId?: number
  patchName?: string
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
  path: string
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
