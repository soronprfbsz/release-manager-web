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
  categories: string[]
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
  majorMinor: string
  createdBy: string
  comment: string
  customVersion: string | null
  createdAt: string
  updatedAt: string
  releaseFiles: ReleaseFileSimple[]
}

/** 릴리즈 파일 트리 노드 */
export interface ReleaseFileNode {
  name: string
  path: string
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
