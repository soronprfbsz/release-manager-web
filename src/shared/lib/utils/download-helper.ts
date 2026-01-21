/**
 * Download Helper
 * 진행률 및 취소 지원 다운로드 유틸리티
 */

import { apiClient } from '@/shared/api/client'

export interface DownloadProgressEvent {
  loaded: number
  total?: number
  isApproximate?: boolean
}

export interface DownloadWithProgressOptions {
  url: string
  filename: string
  onProgress?: (event: DownloadProgressEvent) => void
  timeout?: number
  signal?: AbortSignal
}

/**
 * XMLHttpRequest 기반 파일 다운로드
 * - 진행률 실시간 표시
 * - 중간 취소 확실히 동작
 */
export function downloadWithProgress({
  url,
  filename,
  onProgress,
  timeout,
  signal,
}: DownloadWithProgressOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const baseURL = apiClient.getAxiosInstance().defaults.baseURL || ''
    const fullUrl = `${baseURL}${url}`

    const xhr = new XMLHttpRequest()

    // 이미 abort된 경우
    if (signal?.aborted) {
      reject(new DOMException('Download cancelled', 'AbortError'))
      return
    }

    // abort 핸들러
    const onAbort = () => {
      xhr.abort()
    }

    if (signal) {
      signal.addEventListener('abort', onAbort)
    }

    // 진행률
    xhr.onprogress = (event) => {
      const uncompressedSize = xhr.getResponseHeader('X-Uncompressed-Size')
      let total: number | undefined
      let isApproximate = false

      if (uncompressedSize) {
        total = parseInt(uncompressedSize, 10)
        isApproximate = true
      } else if (event.lengthComputable) {
        total = event.total
        isApproximate = false
      }

      onProgress?.({ loaded: event.loaded, total, isApproximate })
    }

    // 완료
    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort)

      if (xhr.status >= 200 && xhr.status < 300) {
        // 파일 저장
        const blob = xhr.response as Blob
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        resolve()
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`))
      }
    }

    // 에러
    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      reject(new Error('Network error'))
    }

    // 타임아웃
    xhr.ontimeout = () => {
      signal?.removeEventListener('abort', onAbort)
      reject(new Error('Request timeout'))
    }

    // abort
    xhr.onabort = () => {
      signal?.removeEventListener('abort', onAbort)
      reject(new DOMException('Download cancelled', 'AbortError'))
    }

    // 요청 설정
    xhr.open('GET', fullUrl, true)
    xhr.responseType = 'blob'
    xhr.withCredentials = true
    if (timeout) {
      xhr.timeout = timeout
    }

    // 요청 시작
    xhr.send()
  })
}

/**
 * Content-Disposition 헤더에서 파일명 추출
 */
export function extractFilenameFromHeader(
  contentDisposition: string | null,
  defaultFilename: string
): string {
  if (!contentDisposition) return defaultFilename

  const filenameStarMatch = contentDisposition.match(/filename\*=(?:UTF-8'')?([^;\s]+)/)
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1])
    } catch {
      // 디코딩 실패 시 다음 패턴 시도
    }
  }

  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (filenameMatch?.[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }

  return defaultFilename
}
