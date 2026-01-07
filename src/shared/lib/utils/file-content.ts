/**
 * File Content Utilities
 * 파일 내용 처리 공통 유틸리티
 */

/**
 * 공통 파일 내용 응답 타입
 */
export interface FileContentResponse {
  path: string
  fileName: string
  size: number
  content: string
  mimeType?: string      // 파일의 MIME 타입
  isBinary?: boolean     // true면 content가 Base64 인코딩됨
}

/**
 * Base64 인코딩된 내용을 Blob으로 변환
 * @param base64Content Base64 인코딩된 문자열
 * @param mimeType MIME 타입 (기본값: application/octet-stream)
 * @returns Blob 객체 또는 실패 시 null
 */
export function base64ToBlob(base64Content: string, mimeType: string = 'application/octet-stream'): Blob | null {
  try {
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return new Blob([bytes], { type: mimeType })
  } catch (error) {
    console.error('Failed to decode Base64 content:', error)
    return null
  }
}

/**
 * Base64 인코딩된 내용을 텍스트로 변환 (UTF-8)
 * @param base64Content Base64 인코딩된 문자열
 * @returns 디코딩된 텍스트 문자열 또는 실패 시 null
 */
export function base64ToText(base64Content: string): string | null {
  try {
    // Base64 → binary string → Uint8Array → UTF-8 텍스트
    const binaryString = atob(base64Content)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(bytes)
  } catch (error) {
    console.error('Failed to decode Base64 content to text:', error)
    return null
  }
}

/**
 * 파일 확장자로 PDF 파일 여부 확인
 */
export function isPdfFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf')
}

/**
 * 파일 확장자로 이미지 파일 여부 확인
 * SVG는 XML 기반 텍스트 파일이므로 제외 (코드 뷰어로 표시)
 */
export function isImageFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop()
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'].includes(ext || '')
}

/**
 * 파일 확장자로 바이너리 파일 여부 확인 (PDF 또는 이미지)
 */
export function isBinaryFileByExtension(fileName: string): boolean {
  return isPdfFile(fileName) || isImageFile(fileName)
}

