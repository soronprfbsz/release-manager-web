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
  // 1. 최신 Clipboard API 시도 (HTTPS 또는 localhost에서만 동작)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 실패 시 폴백으로 진행
    }
  }

  // 2. 폴백: execCommand 사용 (HTTP 환경용, 레거시 방식)
  return fallbackCopyToClipboard(text)
}

/**
 * 레거시 방식의 클립보드 복사 (HTTP 환경용)
 *
 * 주의사항:
 * - 반드시 사용자 상호작용(클릭 등) 이벤트 핸들러 내에서 호출되어야 함
 * - textarea가 화면에 "보여야" 선택이 가능한 브라우저가 있음
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea')

  // 값 설정
  textArea.value = text

  // 읽기 전용 속성으로 모바일에서 키보드가 올라오는 것 방지
  textArea.setAttribute('readonly', '')

  // 화면에 보이지만 사용자에게 방해되지 않도록 스타일 설정
  // 완전히 숨기면(display:none, visibility:hidden, opacity:0) 일부 브라우저에서 선택 안 됨
  textArea.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 2px;
    height: 2px;
    padding: 0;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
    color: transparent;
    z-index: -1;
  `

  document.body.appendChild(textArea)

  // iOS Safari 대응
  const range = document.createRange()
  range.selectNodeContents(textArea)

  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }

  // 텍스트 선택 (일반 브라우저용)
  textArea.select()

  // iOS Safari 대응: setSelectionRange로 전체 선택
  textArea.setSelectionRange(0, text.length)

  let successful = false
  try {
    successful = document.execCommand('copy')
  } catch {
    successful = false
  }

  document.body.removeChild(textArea)

  // 선택 해제
  if (selection) {
    selection.removeAllRanges()
  }

  return successful
}
