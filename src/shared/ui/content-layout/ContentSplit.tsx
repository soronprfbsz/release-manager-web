/**
 * Content Split Layout Component
 * 좌/우 분할 레이아웃 컴포넌트
 * - 버전관리, 사이트, 부서 관리 등 트리+상세 구조용
 * - treeWidth prop 으로 좌측 패널 너비 조정 (기본 40%)
 *
 *  ⟡ 표면 정책 — 두 패널은 카드 박스가 아니라 콘텐츠 면 위에 그대로 놓이고,
 *    사이 경계는 세로 헤어라인 하나가 진다. 분할은 장식이 아니라 구조라서 경계는
 *    남기되(각 패널이 독립 스크롤이라 어디서 끝나는지 알 수 없으면 곤란하다) 상자로
 *    감싸지는 않는다. 트리 패널에 별도 바탕색을 주지 않는 것이 중요하다 — 바로 왼쪽에
 *    회색 사이드바 크롬이 붙어 있어 두 회색 기둥이 뭉개진다.
 *
 *  ⟡ Viewport-bound 정책 — 트리+상세 페이지는 두 패널이 항상 동일 높이.
 *    각 패널은 자체 내부 ScrollArea 로 콘텐츠 오버플로우 처리.
 *    부모(PageLayout fullHeight) 가 잔여 viewport 높이 공급 → 양쪽 패널이 그 안에서
 *    grid stretch 로 동일 높이를 차지함. 페이지 하단 padding (py-7) 은 그대로 노출.
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { ScrollArea } from '@/shared/ui/scroll-area'


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
        // 패널 사이는 여백이 아니라 세로 헤어라인 하나로 가른다
        'lg:divide-x lg:divide-border',
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
  /** header 를 밴드 스타일(패딩·하단 보더) 없이 그대로 렌더 — 헤더가 자체 보더를 가질 때 사용 */
  rawHeader?: boolean
  /** 자식 요소 */
  children: React.ReactNode
  /** 추가 className */
  className?: string
}

function ContentSplitTree({
  title,
  actions,
  header,
  rawHeader = false,
  children,
  className,
}: ContentSplitTreeProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden lg:pr-4', className)}>
      {rawHeader ? (
        <div className="flex-none">{header}</div>
      ) : (
        <div className="px-4 py-2.5 flex-none flex items-center justify-between border-b border-border">
          {header || (
            <>
              <h3 className="text-base font-semibold">{title}</h3>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </>
          )}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-2 py-2">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
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
    <div className={cn('flex flex-col overflow-hidden lg:pl-5', className)}>
      {header && (
        <div className="px-5 py-3 flex-none flex items-center justify-between min-h-[56px] border-b border-border">
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
            <div className="px-5 pb-4 pt-3">
              {children}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Export Compound Component
// ============================================================================

export const ContentSplit = Object.assign(ContentSplitRoot, {
  Tree: ContentSplitTree,
  Detail: ContentSplitDetail,
})
