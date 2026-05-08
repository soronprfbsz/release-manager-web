/**
 * 브라우저 네이티브 다운로드 트리거 유틸리티
 *
 * 백엔드의 모든 download endpoint 는 SecurityConfig 에서 permitAll() 처리되어 있어
 * 인증 헤더 없이 직접 호출 가능. 브라우저 다운로드 매니저가 진행률을 처리하므로
 * in-app 토스트 / XHR blob 방식이 불필요하다.
 *
 * - 큰 파일도 브라우저 스트림으로 처리 (메모리 부담 없음)
 * - 페이지 이동 / 새로고침 / 창 닫기와 무관하게 다운로드 계속됨
 * - Content-Disposition 헤더의 filename 을 그대로 사용 (suggestedFilename 생략 권장)
 */
export function triggerBrowserDownload(url: string, suggestedFilename?: string): void {
  const a = document.createElement('a')
  // Vite proxy 경유이므로 /api/... 상대경로를 그대로 사용
  a.href = url
  if (suggestedFilename) {
    a.download = suggestedFilename
  }
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
