/**
 * TabbedContentCard
 * 탭이 있는 컨텐츠 카드의 표준 wrapper.
 *
 * <p>마진 / 구분선 / 탭·컨텐츠 padding 등 모든 스타일을 캡슐화하여
 *  페이지가 `tabs` 배열과 `value` / `onValueChange` 만 넘기면 동일한
 *  UX 가 자동 적용된다. 헤더 우측에 검색·필터 등을 두려면 `headerRight`.
 *
 *  레이아웃: 페이지 레벨 탭 (border-b 가 전체 폭 확장) + 각 탭 콘텐츠는 Card 로 분리.
 *  Releases / Patches 페이지의 페이지-레벨 탭 패턴과 동일.
 *
 * <pre>{@code
 *   <TabbedContentCard
 *     value={currentTab}
 *     onValueChange={setCurrentTab}
 *     tabs={[
 *       { value: 'standard', label: '표준', icon: Tag, content: <StandardTab/> },
 *       { value: 'custom',   label: '커스텀', icon: GitBranch, content: <CustomTab/> },
 *     ]}
 *     headerRight={<Filters/>}
 *   />
 * }</pre>
 */

import type { ReactNode } from 'react'


import { cn } from '@/shared/lib/utils'
import { Card } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import type { LucideIcon } from 'lucide-react'

export interface TabbedTab {
  /** Tabs.Trigger / Tabs.Content 의 value */
  value: string
  /** 탭 라벨 텍스트 */
  label: string
  /** 탭 라벨 좌측 아이콘 (옵션) */
  icon?: LucideIcon
  /** 탭이 active 일 때 표시될 컨텐츠 */
  content: ReactNode
  /** 이 탭만 컨텐츠 영역 className 을 override (기본: 'px-8 py-8') */
  contentClassName?: string
}

interface TabbedContentCardProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabbedTab[]
  /** TabsList 우측 슬롯 (검색·필터 등) */
  headerRight?: ReactNode
  /** Tabs 루트 className 확장 */
  className?: string
  /** 모든 탭 컨텐츠 영역의 기본 className (개별 tab 의 contentClassName 이 우선) */
  defaultContentClassName?: string
  /**
   * 부모(PageLayout content area) 의 잔여 높이를 채우는 fill 모드.
   *  - Tabs → flex flex-col flex-1
   *  - 활성 TabsContent → flex-1 min-h-0
   *  - 안의 Card → flex-1 + 내부 콘텐츠 영역이 단일 스크롤 컨테이너
   */
  fullHeight?: boolean
}

const DEFAULT_CONTENT_CLASS = 'px-8 py-8'

export function TabbedContentCard({
  value,
  onValueChange,
  tabs,
  headerRight,
  className,
  defaultContentClassName = DEFAULT_CONTENT_CLASS,
  fullHeight = false,
}: TabbedContentCardProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn(
        'w-full',
        fullHeight && 'flex flex-col flex-1 min-h-0',
        className,
      )}
    >
      <TabsList>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              {tab.label}
            </TabsTrigger>
          )
        })}
        {headerRight && (
          <div className="ml-auto flex items-center gap-2 pr-2">
            {headerRight}
          </div>
        )}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn(
            fullHeight && 'flex-1 min-h-0 flex flex-col data-[state=inactive]:hidden',
          )}
        >
          <Card
            className={cn(
              fullHeight && 'flex-1 min-h-0 flex flex-col overflow-hidden',
            )}
          >
            <div
              className={cn(
                tab.contentClassName ?? defaultContentClassName,
                fullHeight && 'flex-1 min-h-0 overflow-auto',
              )}
            >
              {tab.content}
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
