/**
 * Publishing Types
 * 퍼블리싱 리소스 타입 정의
 */

/** 퍼블리싱 파일 */
export interface PublishingFileItem {
  publishingFileId: number
  fileType: string              // CSS, JS, HTML, IMAGE 등
  fileName: string
  filePath: string
  fileSize: number
  sortOrder: number
}

/** HTML 파일 정보 (열기용) */
export interface PublishingHtmlFile {
  fileName: string
  serveUrl: string
}

/** 퍼블리싱 목록 아이템 */
export interface PublishingListItem {
  publishingId: number
  publishingName: string
  description: string | null
  publishingCategory: string    // INFRAEYE1, INFRAEYE2, COMMON, ETC
  subCategory: string | null    // DASHBOARD, REPORT, MONITORING 등
  customerName: string | null
  sortOrder: number
  fileCount: number
  createdAt: string
  htmlFiles: PublishingHtmlFile[]  // HTML 파일 목록 (열기용)
}

/** 퍼블리싱 상세 */
export interface PublishingDetail {
  publishingId: number
  publishingName: string
  description: string | null
  publishingCategory: string
  subCategory: string | null
  customerId: number | null
  customerName: string | null
  sortOrder: number
  fileCount: number
  totalFileSize: number
  files: PublishingFileItem[]
  htmlFiles: PublishingHtmlFile[]  // HTML 파일 목록 (미리보기용)
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

/** 퍼블리싱 업로드 요청 */
export interface PublishingUploadRequest {
  file: File
  publishingName: string
  publishingCategory: string
  subCategory?: string
  description?: string
  customerId?: number
}

/** 퍼블리싱 수정 요청 */
export interface PublishingUpdateRequest {
  publishingName?: string
  publishingCategory?: string
  subCategory?: string
  description?: string
  customerId?: number | null
}

/** 퍼블리싱 조회 필터 */
export interface PublishingQueryParams {
  publishingCategory?: string
  subCategory?: string
  customerId?: number
  keyword?: string
}

/** 퍼블리싱 순서 변경 요청 */
export interface PublishingReorderRequest {
  publishingIds: number[]
}

/** 퍼블리싱 파일 트리 노드 */
export interface PublishingFileNode {
  name: string
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number
  children?: PublishingFileNode[]
}

/** 퍼블리싱 파일 트리 구조 */
export interface PublishingFileTree {
  publishingId: number
  publishingName: string
  root: PublishingFileNode
}

/** 퍼블리싱 파일 내용 */
export interface PublishingFileContent {
  publishingId: number
  path: string
  fileName: string
  size: number
  content: string
  mimeType?: string      // 파일의 MIME 타입
  isBinary?: boolean     // true면 content가 Base64 인코딩됨
}
