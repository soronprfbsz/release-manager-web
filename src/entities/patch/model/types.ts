/**
 * Patch Entity Types
 * 누적 패치 도메인 타입 정의
 */

export interface CumulativePatch {
  cumulativePatchId: number
  releaseType: string
  customerCode: string | null
  fromVersion: string
  toVersion: string
  patchName: string
  generatedAt: string
  generatedBy: string
  status: string
}

export interface CumulativePatchDetail {
  cumulativePatchId: number
  releaseType: string
  customerCode: string | null
  databaseType: string
  fromVersion: string
  toVersion: string
  fileName: string
  fileSize: number
  checksum: string
  createdBy: string
  createdAt: string
  includedVersions: string[]
}

export interface CumulativePatchGenerateRequest {
  type: 'STANDARD' | 'CUSTOM'
  customerCode?: string
  fromVersion: string
  toVersion: string
  generatedBy: string
  assignedEngineer?: string
  description?: string
}
