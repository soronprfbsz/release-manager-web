/**
 * File Viewer Component
 * 파일 타입에 따라 적절한 뷰어를 렌더링하는 통합 컴포넌트
 *
 * 내부적으로 FileContentViewerModal과 ZipFileExplorer를 처리합니다.
 *
 * 사용 예시:
 * const viewer = useFileContentViewer({ ... })
 *
 * <FileViewer
 *   {...viewer.viewerProps}
 *   open={viewerOpen}
 *   onOpenChange={setViewerOpen}
 *   onDownload={handleDownload}
 * />
 */

import { type LucideIcon, FolderOpen } from 'lucide-react'

import type { FileViewerType } from '@/shared/lib/hooks/use-file-content-viewer'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ZipFileExplorer } from '@/shared/ui/zip-file-explorer'

// ============================================================================
// Types
// ============================================================================

export interface FileViewerProps {
  /** 뷰어 열림 상태 */
  open: boolean
  /** 뷰어 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void
  /** 파일 다운로드 콜백 */
  onDownload?: () => void
  /** 다운로드 가능 여부 */
  canDownload?: boolean
  /** 설명 텍스트 */
  description?: string
  /** ZIP 파일용 아이콘 */
  zipIcon?: LucideIcon

  // 파일 타입 (확장자 기반으로 결정됨)
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

// ============================================================================
// Component
// ============================================================================

export function FileViewer({
  open,
  onOpenChange,
  onDownload,
  canDownload = true,
  description = '파일 내용',
  zipIcon = FolderOpen,
  fileType,
  fileName,
  fileSize,
  content,
  isLoading,
  error,
  pdfBlob,
  isPdfLoading,
  pdfError,
  imageBlob,
  isImageLoading,
  imageError,
  excelBlob,
  isExcelLoading,
  excelError,
  zipBlob,
  isZipLoading,
  zipError,
  docxBlob,
  isDocxLoading,
  docxError,
}: FileViewerProps) {
  // 파일 타입이 ZIP인 경우 ZipFileExplorer 사용
  // (확장자 기반으로 판별되므로 에러 발생 시에도 올바른 뷰어 선택)
  if (fileType === 'zip') {
    return (
      <ZipFileExplorer
        open={open}
        onOpenChange={onOpenChange}
        zipBlob={zipBlob}
        fileName={fileName}
        icon={zipIcon}
        isLoading={isZipLoading}
        error={zipError}
      />
    )
  }

  // ZIP 외 파일은 FileContentViewerModal 사용
  return (
    <FileContentViewerModal
      open={open}
      onOpenChange={onOpenChange}
      fileName={fileName}
      content={content}
      isLoading={isLoading}
      error={error}
      description={description}
      fileSize={fileSize}
      onDownload={onDownload}
      canDownload={canDownload}
      pdfBlob={pdfBlob}
      isPdfLoading={isPdfLoading}
      pdfError={pdfError}
      imageBlob={imageBlob}
      isImageLoading={isImageLoading}
      imageError={imageError}
      excelBlob={excelBlob}
      isExcelLoading={isExcelLoading}
      excelError={excelError}
      docxBlob={docxBlob}
      isDocxLoading={isDocxLoading}
      docxError={docxError}
    />
  )
}
