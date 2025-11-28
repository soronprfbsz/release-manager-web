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
  type: 'standard' | 'custom'
  customerId?: number
  fromVersion: string
  toVersion: string
  generatedBy: string
  patchedBy?: string
  description?: string
  patchName?: string
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
}
