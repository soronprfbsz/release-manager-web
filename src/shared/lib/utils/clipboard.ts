/**
 * 클립보드 복사 유틸리티
 * HTTPS가 아닌 환경에서도 동작하도록 폴백 구현
 */

/**
 * 텍스트를 클립보드에 복사
 * @param text 복사할 텍스트
 * @returns 성공 여부
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. 먼저 최신 Clipboard API 시도
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 실패 시 폴백으로 진행
    }
  }

  // 2. 폴백: execCommand 사용 (레거시 방식)
  return fallbackCopyToClipboard(text)
}

/**
 * 레거시 방식의 클립보드 복사 (HTTP 환경용)
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text

  // 화면에 보이지 않게 스타일 설정
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  textArea.style.top = '-9999px'
  textArea.style.opacity = '0'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch {
    document.body.removeChild(textArea)
    return false
  }
}
