/**
 * Cowork Page
 * 협업 페이지 - 공지사항, 개선제안, QnA 탭 구성
 */

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Megaphone, HelpCircle, Plus, Search } from 'lucide-react'

import {
  AnnouncementTab,
  QnaTab,
} from '@/widgets/sharing/cowork'

import type { PostFormMode } from '@/features/board'

import { ContentCard } from '@/shared/ui/content-layout'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

type TabType = 'announcements' | 'qna'

const TAB_CONFIG = {
  announcements: {
    icon: Megaphone,
    label: '공지사항',
    addTooltip: '공지사항 작성',
  },
  qna: {
    icon: HelpCircle,
    label: 'QnA',
    addTooltip: 'QnA 작성',
  },
} as const

export function CoworkPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'announcements'

  // 글쓰기 폼 상태
  const [formMode, setFormMode] = useState<PostFormMode>(null)

  // 검색어 상태
  const [keyword, setKeyword] = useState('')

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
    // 탭 변경 시 검색어 초기화
    setKeyword('')
  }

  const handleOpenForm = () => {
    setFormMode('create')
  }

  const handleCloseForm = () => {
    setFormMode(null)
  }

  const currentTabConfig = TAB_CONFIG[currentTab]

  return (
    <PageLayout
      actions={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleOpenForm} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentTabConfig.addTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <ContentCard noPadding>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between px-8 pt-2">
            <TabsList variant="line" className="border-0">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tabKey) => {
                const config = TAB_CONFIG[tabKey]
                const Icon = config.icon
                return (
                  <TabsTrigger key={tabKey} value={tabKey} variant="line">
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색..."
                className="pl-8 h-8 w-[200px] text-sm"
              />
            </div>
          </div>

          <TabsContent value="announcements" className="px-8 pb-8">
            <AnnouncementTab
              formMode={formMode}
              onFormClose={handleCloseForm}
              keyword={keyword}
            />
          </TabsContent>

          <TabsContent value="qna" className="px-8 pb-8">
            <QnaTab
              formMode={formMode}
              onFormClose={handleCloseForm}
              keyword={keyword}
            />
          </TabsContent>
        </Tabs>
      </ContentCard>
    </PageLayout>
  )
}
