/**
 * useNavigationBlock
 *
 * 장시간 작업 진행 중 페이지 이탈을 차단하는 통합 훅.
 *
 * - beforeunload: F5 / 새로고침 / 탭닫기 / 외부 URL 이동 차단
 * - useBlocker (react-router): SPA 라우팅(메뉴 클릭 등) 차단 + confirm 다이얼로그
 *
 * @param blocked  true 이면 이탈 차단 활성
 * @param message  SPA 라우팅 차단 시 confirm 다이얼로그 메시지
 */
import { useEffect } from 'react'

import { useBlocker } from 'react-router-dom'

export function useNavigationBlock(
  blocked: boolean,
  message = '작업이 진행 중입니다. 떠나시겠습니까? 진행 중인 작업이 미완료될 수 있습니다.'
) {
  // (1) F5 / 새로고침 / 탭닫기 / 다른 사이트 이동
  useEffect(() => {
    if (!blocked) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [blocked])

  // (2) SPA 라우팅 (react-router useBlocker)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    blocked && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    const ok = window.confirm(message)
    if (ok) blocker.proceed?.()
    else blocker.reset?.()
  }, [blocker, message])
}
