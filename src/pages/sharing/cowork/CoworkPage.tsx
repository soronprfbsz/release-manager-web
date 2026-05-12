/**
 * Cowork Page
 * 협업 페이지 - 가이드, 자유게시판 탭 구성
 */

import { useState } from 'react'

import { BookOpen, MessageCircle, Plus, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'


import {
  AnnouncementTab,
  QnaTab,
} from '@/widgets/sharing/cowork'

import type { PostFormMode } from '@/features/board'

import { Button } from '@/shared/ui/button'
import { TabbedContentCard } from '@/shared/ui/content-layout'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

type TabType = 'announcements' | 'qna'

const TAB_CONFIG = {
  announcements: {
    icon: BookOpen,
    label: '정보게시판',
    addTooltip: '정보 공유글 작성',
  },
  qna: {
    icon: MessageCircle,
    label: '자유게시판',
    addTooltip: '게시글 작성',
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
      <TabbedContentCard
        value={currentTab}
        onValueChange={handleTabChange}
        tabs={[
          {
            value: 'announcements',
            label: TAB_CONFIG.announcements.label,
            icon: TAB_CONFIG.announcements.icon,
            content: (
              <AnnouncementTab
                formMode={formMode}
                onFormClose={handleCloseForm}
                keyword={keyword}
              />
            ),
          },
          {
            value: 'qna',
            label: TAB_CONFIG.qna.label,
            icon: TAB_CONFIG.qna.icon,
            content: (
              <QnaTab
                formMode={formMode}
                onFormClose={handleCloseForm}
                keyword={keyword}
              />
            ),
          },
        ]}
        headerRight={
          /* 검색 — TabsBar 우측 슬롯 */
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색..."
              className="pl-8 h-8 w-[200px] text-sm"
            />
          </div>
        }
      />
    </PageLayout>
  )
}
