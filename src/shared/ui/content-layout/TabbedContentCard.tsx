/**
 * TabbedContentCard
 * 탭이 있는 컨텐츠 카드의 표준 wrapper.
 *
 * <p>마진 / 구분선 / 탭·컨텐츠 padding 등 모든 스타일을 캡슐화하여
 *  페이지가 `tabs` 배열과 `value` / `onValueChange` 만 넘기면 동일한
 *  UX 가 자동 적용된다. 헤더 우측에 검색·필터 등을 두려면 `headerRight`.
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

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Tabs, TabsBar, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { ContentCard } from './ContentCard'

export interface TabbedTab {
  /** Tabs.Trigger / Tabs.Content 의 value */
  value: string
  /** 탭 라벨 텍스트 */
  label: string
  /** 탭 라벨 좌측 아이콘 (옵션) */
  icon?: LucideIcon
  /** 탭이 active 일 때 표시될 컨텐츠 */
  content: ReactNode
  /** 이 탭만 컨텐츠 영역 className 을 override (기본: 'px-8 pb-8') */
  contentClassName?: string
}

interface TabbedContentCardProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabbedTab[]
  /** TabsBar 우측 슬롯 (검색·필터 등) */
  headerRight?: ReactNode
  /** 외곽 ContentCard className 확장 */
  className?: string
  /** 모든 탭 컨텐츠 영역의 기본 className (개별 tab 의 contentClassName 이 우선) */
  defaultContentClassName?: string
  /**
   * 부모(PageLayout content area) 의 잔여 높이를 채우는 fill 모드.
   *  - Card → flex-1 + flex flex-col + overflow-hidden
   *  - Tabs → flex flex-col flex-1
   *  - 활성 TabsContent → flex-1 min-h-0 overflow-auto (단일 스크롤 컨테이너)
   */
  fullHeight?: boolean
}

const DEFAULT_CONTENT_CLASS = 'px-8 pb-8 pt-10'

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
    <ContentCard noPadding fullHeight={fullHeight} className={className}>
      <Tabs
        value={value}
        onValueChange={onValueChange}
        className={cn('w-full', fullHeight && 'flex flex-col flex-1 min-h-0')}
      >
        <TabsBar>
          <TabsList variant="line">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.value} value={tab.value} variant="line">
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          {headerRight}
        </TabsBar>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className={cn(
              tab.contentClassName ?? defaultContentClassName,
              fullHeight && 'flex-1 min-h-0 overflow-auto data-[state=inactive]:hidden',
            )}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </ContentCard>
  )
}
