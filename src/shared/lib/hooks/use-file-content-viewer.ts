/**
 * File Content Viewer Hook
 * 파일 내용 조회 및 타입별 처리를 위한 공통 훅
 *
 * 사용 예시:
 * const viewer = useFileContentViewer({
 *   filePath: selectedFile?.filePath,
 *   fileName: selectedFile?.name,
 *   enabled: fileViewerOpen && selectedFile !== null,
 *   useContentQuery: (path, enabled) => useMyFileContentQuery(path, { enabled }),
 * })
 *
 * <FileViewer {...viewer} open={viewerOpen} onOpenChange={setViewerOpen} />
 */

import { useMemo } from 'react'

import {
  base64ToBlob,
  base64ToText,
  isPdfFile,
  isImageFile,
  isZipFile,
  isExcelFile,
  isDocxFile,
} from '@/shared/lib/utils/file-content'

// ============================================================================
// Types
// ============================================================================

/** 파일 타입 */
export type FileViewerType = 'pdf' | 'image' | 'excel' | 'zip' | 'docx' | 'text'

/** 파일 내용 데이터 (API 응답 형식) */
export interface FileContentData {
  content: string
  mimeType?: string
  isBinary?: boolean
}

/** 파일 내용 쿼리 결과 */
export interface FileContentQueryResult {
  data: FileContentData | undefined
  isLoading: boolean
  error: Error | null
}

/** useFileContentViewer 옵션 */
export interface UseFileContentViewerOptions {
  /** 파일 경로 */
  filePath: string | undefined | null
  /** 파일 이름 */
  fileName: string | undefined | null
  /** 파일 크기 */
  fileSize?: number
  /** 훅 활성화 여부 */
  enabled: boolean
  /** 파일 내용 조회 쿼리 함수 */
  useContentQuery: (path: string, enabled: boolean) => FileContentQueryResult
}

/** useFileContentViewer 반환값 */
export interface FileContentViewerState {
  /** 파일 타입 */
  fileType: FileViewerType
  /** 파일 이름 */
  fileName: string
  /** 파일 크기 */
  fileSize?: number
  /** 텍스트 콘텐츠 (text 타입일 때) */
  textContent: string | null
  /** Blob 데이터 (pdf, image, excel, zip 타입일 때) */
  blobData: Blob | null
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 */
  error: Error | null
  /** 각 타입별 상태 (FileViewer 컴포넌트에 직접 전달용) */
  viewerProps: {
    // 파일 타입 (확장자 기반)
    fileType: FileViewerType
    // 공통
    fileName: string
    fileSize?: number
    // 텍스트
    content: string | null
    isLoading: boolean
    error: Error | null
    // PDF
    pdfBlob: Blob | null
    isPdfLoading: boolean
    pdfError: Error | null
    // 이미지
    imageBlob: Blob | null
    isImageLoading: boolean
    imageError: Error | null
    // 엑셀
    excelBlob: Blob | null
    isExcelLoading: boolean
    excelError: Error | null
    // ZIP
    zipBlob: Blob | null
    isZipLoading: boolean
    zipError: Error | null
    // Word 문서
    docxBlob: Blob | null
    isDocxLoading: boolean
    docxError: Error | null
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/** 파일 이름으로 파일 타입 결정 */
export function getFileType(fileName: string): FileViewerType {
  if (isPdfFile(fileName)) return 'pdf'
  if (isImageFile(fileName)) return 'image'
  if (isExcelFile(fileName)) return 'excel'
  if (isZipFile(fileName)) return 'zip'
  if (isDocxFile(fileName)) return 'docx'
  return 'text'
}

/** 바이너리 파일 여부 확인 */
function isBinaryType(type: FileViewerType): boolean {
  return type === 'pdf' || type === 'image' || type === 'excel' || type === 'zip' || type === 'docx'
}

// ============================================================================
// Hook
// ============================================================================

export function useFileContentViewer({
  filePath,
  fileName,
  fileSize,
  enabled,
  useContentQuery,
}: UseFileContentViewerOptions): FileContentViewerState {
  // 파일 타입 결정
  const fileType = useMemo(() => {
    if (!fileName) return 'text'
    return getFileType(fileName)
  }, [fileName])

  const isBinary = isBinaryType(fileType)

  // 파일 내용 조회
  const { data: contentData, isLoading, error } = useContentQuery(
    filePath ?? '',
    enabled && filePath !== null && filePath !== undefined
  )

  // 바이너리 데이터 처리 (PDF, 이미지, 엑셀, ZIP)
  // 파일 타입이 바이너리면 API 응답의 isBinary 플래그와 관계없이 blob 생성 시도
  const blobData = useMemo(() => {
    if (!contentData?.content) return null
    if (!isBinary) return null

    // SVG 파일이고 API 응답이 텍스트인 경우(isBinary가 false), 텍스트를 직접 Blob으로 변환
    const isSvg = fileName?.toLowerCase().endsWith('.svg')
    if (isSvg && !contentData.isBinary) {
      // SVG 텍스트를 직접 Blob으로 변환 (base64 디코딩 불필요)
      return new Blob([contentData.content], { type: 'image/svg+xml' })
    }

    // 바이너리 타입 파일은 항상 base64로 인코딩된 것으로 처리
    return base64ToBlob(contentData.content, contentData.mimeType)
  }, [contentData, isBinary, fileName])

  // 텍스트 콘텐츠 처리
  const textContent = useMemo(() => {
    if (!contentData) return null
    if (isBinary) return null

    // isBinary가 true이면 base64 디코딩
    if (contentData.isBinary) {
      return base64ToText(contentData.content)
    }
    return contentData.content || null
  }, [contentData, isBinary])

  // FileViewer 컴포넌트에 직접 전달할 props 생성
  const viewerProps = useMemo(() => {
    const isPdf = fileType === 'pdf'
    const isImage = fileType === 'image'
    const isExcel = fileType === 'excel'
    const isZip = fileType === 'zip'
    const isDocx = fileType === 'docx'

    return {
      // 파일 타입 (확장자 기반, 에러 시에도 올바른 뷰어 선택을 위해 필요)
      fileType,
      // 공통
      fileName: fileName || '',
      fileSize,
      // 텍스트
      content: textContent,
      isLoading: isLoading && !isBinary,
      error: !isBinary ? error : null,
      // PDF
      pdfBlob: isPdf ? blobData : null,
      isPdfLoading: isPdf && isLoading,
      pdfError: isPdf ? error : null,
      // 이미지
      imageBlob: isImage ? blobData : null,
      isImageLoading: isImage && isLoading,
      imageError: isImage ? error : null,
      // 엑셀
      excelBlob: isExcel ? blobData : null,
      isExcelLoading: isExcel && isLoading,
      excelError: isExcel ? error : null,
      // ZIP
      zipBlob: isZip ? blobData : null,
      isZipLoading: isZip && isLoading,
      zipError: isZip ? error : null,
      // Word 문서
      docxBlob: isDocx ? blobData : null,
      isDocxLoading: isDocx && isLoading,
      docxError: isDocx ? error : null,
    }
  }, [fileType, fileName, fileSize, textContent, blobData, isLoading, error, isBinary])

  return {
    fileType,
    fileName: fileName || '',
    fileSize,
    textContent,
    blobData,
    isLoading,
    error,
    viewerProps,
  }
}
