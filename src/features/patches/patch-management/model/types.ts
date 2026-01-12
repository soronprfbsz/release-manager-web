/**
 * Patch Management Feature Types
 * 패치 관리 기능 타입 정의
 */

export interface PatchCreateFormData {
  fromVersion: string
  toVersion: string
  customerCode: string
  assigneeId: number | null
  description: string
  includeAllBuildVersions: boolean
  patchName: string
}

export interface CustomPatchCreateFormData {
  customerId: number | null
  fromVersion: string
  toVersion: string
  assigneeId: number | null
  description: string
  patchName: string
}

export interface PatchFiltersState {
  keyword?: string
  releaseType?: 'STANDARD' | 'CUSTOM'
}

export type PatchFormMode = 'create' | null

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}
