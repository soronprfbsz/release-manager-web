/**
 * Download Helper
 * 진행률 지원 다운로드 공통 유틸리티
 */

import { apiClient } from '@/shared/api/client'

export interface DownloadProgressEvent {
  /** 다운로드된 바이트 수 */
  loaded: number
  /** 전체 크기 (바이트) */
  total?: number
  /** 추정치 여부 (ZIP 다운로드 시 true) */
  isApproximate?: boolean
}

export interface DownloadWithProgressOptions {
  /** 다운로드 URL (baseURL 이후 경로) */
  url: string
  /** 저장될 파일명 */
  filename: string
  /** 진행률 콜백 */
  onProgress?: (event: DownloadProgressEvent) => void
  /** 타임아웃 (ms) */
  timeout?: number
}

/**
 * 진행률을 지원하는 파일 다운로드
 *
 * 헤더 사용 전략:
 * - ZIP 스트리밍: X-Uncompressed-Size 헤더 사용 (추정치)
 * - 단일 파일: Content-Length 헤더 사용 (정확함)
 */
export async function downloadWithProgress({
  url,
  filename,
  onProgress,
  timeout,
}: DownloadWithProgressOptions): Promise<void> {
  const axiosInstance = apiClient.getAxiosInstance()

  const response = await axiosInstance.get(url, {
    responseType: 'blob',
    timeout,
    onDownloadProgress: (progressEvent) => {
      if (!onProgress) return

      // X-Uncompressed-Size 헤더 확인 (ZIP 스트리밍용)
      const xhr = progressEvent.event?.target as XMLHttpRequest | undefined
      const uncompressedSizeHeader = xhr?.getResponseHeader?.('X-Uncompressed-Size')

      let total: number | undefined
      let isApproximate = false

      if (uncompressedSizeHeader) {
        // ZIP 스트리밍: X-Uncompressed-Size 사용 (추정치)
        total = parseInt(uncompressedSizeHeader, 10)
        isApproximate = true
      } else if (progressEvent.total && progressEvent.total > 0) {
        // 단일 파일: Content-Length 사용 (정확함)
        total = progressEvent.total
        isApproximate = false
      }

      onProgress({
        loaded: progressEvent.loaded,
        total,
        isApproximate,
      })
    },
  })

  // Blob 생성 및 다운로드
  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

/**
 * Content-Disposition 헤더에서 파일명 추출
 */
export function extractFilenameFromHeader(
  contentDisposition: string | null,
  defaultFilename: string
): string {
  if (!contentDisposition) return defaultFilename

  // filename*= (RFC 5987) 먼저 시도
  const filenameStarMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;\s]+)/)
  if (filenameStarMatch && filenameStarMatch[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1])
    } catch {
      // 디코딩 실패 시 다음 패턴 시도
    }
  }

  // filename= 시도
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }

  return defaultFilename
}
