/**
 * Patch Entity Types
 * 패치 도메인 타입 정의
 */

export interface CumulativePatch {
  patchId: number
  releaseType: string
  customerCode: string | null
  customerName: string | null
  fromVersion: string
  toVersion: string
  patchName: string
  generatedAt: string
  generatedBy: string
  description: string | null
  patchedBy: string | null
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
  generatedAt: string
  generatedBy: string
  description: string | null
  patchedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CumulativePatchGenerateRequest {
  type: string
  customerId?: number
  fromVersion: string
  toVersion: string
  generatedBy: string
  patchedBy?: string
  description?: string
  patchName?: string
}
