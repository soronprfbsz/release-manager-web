/**
 * File Entity Types
 * 파일 도메인 타입 정의
 */

/** 파일 정보 */
export interface File {
  resourceFileId: number
  fileType: string
  fileCategory: string
  subCategory: string | null
  resourceFileName: string
  fileName: string
  filePath: string
  fileSize: number
  description: string | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  createdAt: string
}

/** 파일 업로드 요청 */
export interface FileUploadRequest {
  file: globalThis.File
  fileCategory: string
  subCategory?: string
  resourceFileName: string
  description?: string
}

/** 파일 수정 요청 */
export interface FileUpdateRequest {
  fileCategory: string
  subCategory?: string
  resourceFileName: string
  description?: string
}

/** 파일 내용 */
export interface FileContent {
  resourceFileId: number
  path: string
  fileName: string
  size: number
  mimeType?: string
  isBinary?: boolean
  content: string
}

