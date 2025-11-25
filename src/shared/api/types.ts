export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  timestamp: string
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Auth Types
export interface SignUpRequest {
  email: string
  password: string
  accountName: string
}

export interface SignUpResponse {
  accountId: number
  email: string
  accountName: string
  role: string
  createdAt: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AccountInfo {
  accountId: number
  email: string
  accountName: string
  role: string
}

export interface AccessTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  accountInfo: AccountInfo
}

// Release Types
export interface DatabaseNode {
  databaseType: string
  files: string[]
}

export interface VersionNode {
  versionId: number
  version: string
  createdAt: string
  createdBy: string
  comment: string
  isInstall: boolean
  databases: DatabaseNode[]
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
  databaseTypeName: string
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
  majorMinor: string
  createdBy: string
  comment: string
  customVersion: string | null
  isInstall: boolean
  createdAt: string
  updatedAt: string
  releaseFiles: ReleaseFileSimple[]
}

// Cumulative Patch Types
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

export interface CumulativePatchListResponse {
  status: string
  data: CumulativePatch[]
}

export interface CumulativePatchGenerateRequest {
  type: 'STANDARD' | 'CUSTOM'
  customerCode?: string
  fromVersion: string
  toVersion: string
  generatedBy: string
  description?: string
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

// Customer Types
export interface Customer {
  customerId: number
  customerCode: string
  customerName: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerCreateRequest {
  customerCode: string
  customerName: string
  description?: string
  isActive?: boolean
}

export interface CustomerUpdateRequest {
  customerName?: string
  description?: string
  isActive?: boolean
}

export interface CustomerListResponse {
  success: boolean
  data: Customer[]
}
