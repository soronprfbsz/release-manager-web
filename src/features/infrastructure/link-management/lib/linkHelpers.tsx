/**
 * Link Helper Functions
 * 링크 리소스 관련 헬퍼 함수
 */

import { Link as LinkIcon } from 'lucide-react'

/**
 * 링크 서브카테고리 아이콘 반환
 * 모든 링크는 탭 아이콘과 동일한 Link 아이콘 사용
 */
export const getLinkIcon = (_subCategory: string | null) => {
  return <LinkIcon className="w-5 h-5 text-primary" />
}

/**
 * 링크 그룹 아이콘 반환
 * 모든 링크 카테고리는 탭 아이콘과 동일한 Link 아이콘 사용
 */
export const getLinkGroupIcon = (_category: string) => {
  return <LinkIcon className="w-5 h-5" />
}

