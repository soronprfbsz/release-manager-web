/**
 * Content Split Layout Component
 * 좌/우 분할 레이아웃 컴포넌트
 * - 버전관리, 사이트, 부서 관리 등 트리+상세 구조용
 * - treeWidth prop 으로 좌측 패널 너비 조정 (기본 40%)
 *
 *  ⟡ 표면 정책 — 두 패널은 각각 카드다. 목록 화면은 카드 박스를 걷어냈지만
 *    분할 화면은 예외로 둔다: 두 패널이 독립 스크롤을 갖는 별개의 영역이라
 *    상자로 묶여야 어디까지가 트리이고 어디부터가 상세인지 읽힌다.
 *    (세로 구분선 하나로 가르는 안을 먼저 시도했으나, 선이 스크롤 구간에서 끊겨
 *     경계가 흐려졌다 — 카드로 감싸면 이 문제가 구조적으로 사라진다.)
 *
 *  ⟡ 타이틀 밴드 — --panel-header 전용 토큰이다. 카드 면과 명도가 같고 채도만 낮아
 *    명도가 아니라 색조로 구분된다(제목 띠는 물러나야 한다).
 *    테이블 헤더(--muted)와 토큰을 나눈 이유는 요구가 달라서다 — 테이블 헤더는
 *    컬럼 라벨을 받쳐야 하므로 더 또렷한 띠가 필요하다.
 *    primary 틴트를 얹어 봤으나 브랜드 색이 구조 요소에 번져 산만해졌다.
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

/**
 * 패널 머리의 제목 밴드. 두 패널이 같은 높이로 맞아야 나란히 놓였을 때 어깨가 맞는다.
 * 배경은 --primary 10% 틴트 — 양 테마 불변인 gold 를 포인트로만 쓴다.
 */
const PANEL_HEADER =
  'flex-none flex items-center justify-between gap-2 px-4 min-h-[44px] py-2 ' +
  'border-b border-border bg-panel-header'

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
  /** 헤더 밴드 className 추가 — 짝 패널이 커스텀 헤더라 높이를 맞춰야 할 때 사용 */
  headerClassName?: string
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
  headerClassName,
  children,
  className,
}: ContentSplitTreeProps) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      {rawHeader ? (
        <div className="flex-none">{header}</div>
      ) : (
        <div className={cn(PANEL_HEADER, headerClassName)}>
          {header || (
            <>
              <h3 className="text-sm font-semibold">{title}</h3>
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
    </Card>
  )
}

// ============================================================================
// ContentSplit.Detail (Right Panel)
// ============================================================================

interface ContentSplitDetailProps {
  /** 패널 제목 (Tree 와 같은 밴드로 렌더된다) */
  title?: string
  /** 헤더 우측 액션 */
  actions?: React.ReactNode
  /** 헤더 영역 커스텀 컨텐츠 (title/actions 대신 사용) */
  header?: React.ReactNode
  /** 헤더 밴드 className 추가 — 짝 패널이 커스텀 헤더라 높이를 맞춰야 할 때 사용 */
  headerClassName?: string
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
  title,
  actions,
  header,
  headerClassName,
  children,
  className,
  isEmpty = false,
  emptyMessage = '항목을 선택해주세요.',
}: ContentSplitDetailProps) {
  const hasHeader = title || actions || header

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      {hasHeader && (
        <div className={cn(PANEL_HEADER, headerClassName)}>
          {header || (
            <>
              <h3 className="text-sm font-semibold">{title}</h3>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </>
          )}
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
