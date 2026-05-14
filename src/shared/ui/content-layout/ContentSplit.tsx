/**
 * Content Split Layout Component
 * 좌/우 분할 레이아웃 컴포넌트
 * - 버전관리, 고객사, 부서 관리 등 트리+상세 구조용
 * - treeWidth prop으로 좌측 패널 너비 조정 (기본 40%)
 *
 *  ⟡ 자연 흐름 정책 — 두 패널 모두 콘텐츠 자체 높이로 렌더링.
 *    grid items-start 라 한 쪽이 짧아도 다른 쪽이 강제로 늘어나지 않음.
 *    페이지가 길면 main 이 자연 스크롤. 빈 공간 낭비 없음.
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'

import { CONTENT_SPACING } from './constants'

// ============================================================================
// ContentSplit (Root Container)
// ============================================================================

interface ContentSplitProps {
  children: React.ReactNode
  className?: string
  /** 좌측 패널(Tree) 너비 % (기본: 40) */
  treeWidth?: number
}

function ContentSplitRoot({ children, className, treeWidth = 40 }: ContentSplitProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-[var(--tree-width)_1fr]',
        CONTENT_SPACING.SPLIT_GAP,
        'items-start',
        className
      )}
      style={{ '--tree-width': `${treeWidth}%` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// ============================================================================
// ContentSplit.Tree (Left Panel)
// ============================================================================

interface ContentSplitTreeProps {
  /** 패널 제목 */
  title?: string
  /** 헤더 우측 액션 */
  actions?: React.ReactNode
  /** 헤더 영역 커스텀 컨텐츠 (title/actions 대신 사용) */
  header?: React.ReactNode
  /** 자식 요소 */
  children: React.ReactNode
  /** 추가 className */
  className?: string
}

function ContentSplitTree({
  title,
  actions,
  header,
  children,
  className,
}: ContentSplitTreeProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="px-8 py-6 flex items-center justify-between min-h-[76px] border-b border-border">
        {header || (
          <>
            <h3 className="text-base font-semibold">{title}</h3>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </>
        )}
      </div>
      <div className="px-6 pb-6 pt-4">
        {children}
      </div>
    </Card>
  )
}

// ============================================================================
// ContentSplit.Detail (Right Panel)
// ============================================================================

interface ContentSplitDetailProps {
  /** 헤더 영역 커스텀 컨텐츠 */
  header?: React.ReactNode
  /** 자식 요소 */
  children?: React.ReactNode
  /** 추가 className */
  className?: string
  /** 빈 상태 표시 여부 */
  isEmpty?: boolean
  /** 빈 상태 메시지 */
  emptyMessage?: string
}

function ContentSplitDetail({
  header,
  children,
  className,
  isEmpty = false,
  emptyMessage = '항목을 선택해주세요.',
}: ContentSplitDetailProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      {header && (
        <div className="px-8 py-6 flex items-center justify-between min-h-[76px] border-b border-border">
          {header}
        </div>
      )}
      <div className="px-8 pb-6 pt-4">
        {isEmpty ? (
          <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// Export Compound Component
// ============================================================================

export const ContentSplit = Object.assign(ContentSplitRoot, {
  Tree: ContentSplitTree,
  Detail: ContentSplitDetail,
})
