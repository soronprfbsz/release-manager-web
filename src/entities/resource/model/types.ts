/**
 * Resource Entity Types
 * 리소스 파일 도메인 타입 정의
 */

/** 리소스 파일 정보 */
export interface ResourceFile {
  resourceFileId: number
  fileType: string // 확장자 (sh, pdf 등)
  fileCategory: string // 대분류 (SCRIPT, DOCUMENT 등)
  subCategory: string | null // 소분류
  fileName: string
  filePath: string
  fileSize: number
  description: string | null
  createdAt: string
}

/** 리소스 파일 업로드 요청 */
export interface ResourceFileUploadRequest {
  file: File
  fileCategory: string
  subCategory?: string
  description?: string
}
