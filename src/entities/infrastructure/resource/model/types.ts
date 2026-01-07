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
  resourceFileName: string // 리소스명 (사용자 지정 이름)
  fileName: string // 실제 파일명
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
  resourceFileName: string // 리소스명 (필수)
  description?: string
}

/** 리소스 파일 수정 요청 */
export interface ResourceFileUpdateRequest {
  fileCategory: string
  subCategory?: string
  resourceFileName: string
  description?: string
}

/** 링크 리소스 정보 */
export interface LinkResource {
  resourceLinkId: number // API Guide says resourceLinkId
  linkCategory: string // 대분류
  subCategory: string | null // 소분류
  linkName: string // API Guide says linkName (not title)
  linkUrl: string // API Guide says linkUrl (not url)
  description: string | null
  sortOrder: number // API Guide says sortOrder
  createdAt: string
  updatedAt?: string
}

/** 링크 리소스 생성 요청 */
export interface LinkResourceCreateRequest {
  linkCategory: string
  subCategory?: string
  linkName: string
  linkUrl: string
  description?: string
  createdBy?: string // API Guide includes this
}

/** 리소스 파일 내용 */
export interface ResourceFileContent {
  resourceFileId: number
  path: string
  fileName: string
  size: number
  mimeType?: string      // MIME 타입 (예: application/x-sh, application/pdf)
  isBinary?: boolean     // true면 content가 Base64 인코딩됨
  content: string
}