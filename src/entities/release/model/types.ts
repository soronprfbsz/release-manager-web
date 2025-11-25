/**
 * Release Entity Types
 * 릴리즈 도메인 타입 정의
 */

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
