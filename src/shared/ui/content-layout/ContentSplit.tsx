/**
 * Content Split Layout Component
 * 좌/우 분할 레이아웃 컴포넌트
 * - 버전관리, 고객사, 부서 관리 등 트리+상세 구조용
 * - treeWidth prop 으로 좌측 패널 너비 조정 (기본 40%)
 *
 *  ⟡ Viewport-bound 정책 — 트리+상세 페이지는 두 패널이 항상 동일 높이.
 *    각 패널은 자체 내부 ScrollArea 로 콘텐츠 오버플로우 처리.
 *    부모(PageLayout fullHeight) 가 잔여 viewport 높이 공급 → 양쪽 패널이 그 안에서
 *    grid stretch 로 동일 높이를 차지함. 페이지 하단 padding (py-7) 은 그대로 노출.
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'

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
        'h-full min-h-0',
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
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="px-8 py-6 flex-none flex items-center justify-between min-h-[76px] border-b border-border">
        {header || (
          <>
            <h3 className="text-base font-semibold">{title}</h3>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-6 pb-6 pt-4">
            {children}
          </div>
        </ScrollArea>
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
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      {header && (
        <div className="px-8 py-6 flex-none flex items-center justify-between min-h-[76px] border-b border-border">
          {header}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="px-8 pb-6 pt-4">
              {children}
            </div>
          </ScrollArea>
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
