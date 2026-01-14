/**
 * Resource Page
 * 리소스 관리 페이지 - 서비스, 링크, 파일 등 탭 조합
 */

import { useRef } from 'react'

import { Plus } from 'lucide-react'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { useSearchParams } from 'react-router-dom'

import {
  ServiceTab,
  type ServiceTabHandle,
  LinkResourceTab,
  type LinkResourceTabHandle,
  FileResourceTab,
  type FileResourceTabHandle,
  PublishingTab,
  type PublishingTabHandle,
} from '@/widgets/infrastructure/resource'

import { usePageIcon } from '@/shared/lib/hooks'
import { Button } from '@/shared/ui/button'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'services' | 'links' | 'files' | 'publishing'

const TAB_CONFIG = {
  services: {
    icon: DOMAIN_ICONS.service,
    label: '서비스',
    addTooltip: '서비스 추가',
  },
  links: {
    icon: DOMAIN_ICONS.link,
    label: '링크',
    addTooltip: '링크 추가',
  },
  files: {
    icon: DOMAIN_ICONS.file,
    label: '파일',
    addTooltip: '파일 업로드',
  },
  publishing: {
    icon: DOMAIN_ICONS.publishing,
    label: '퍼블리싱',
    addTooltip: '퍼블리싱 업로드',
  },
} as const

export function ResourcePage() {
  const { icon: pageIcon } = usePageIcon()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'services'

  // Refs for tab components
  const serviceTabRef = useRef<ServiceTabHandle>(null)
  const linkTabRef = useRef<LinkResourceTabHandle>(null)
  const fileTabRef = useRef<FileResourceTabHandle>(null)
  const publishingTabRef = useRef<PublishingTabHandle>(null)

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleAdd = () => {
    switch (currentTab) {
      case 'services':
        serviceTabRef.current?.openAddDialog()
        break
      case 'links':
        linkTabRef.current?.openAddDialog()
        break
      case 'files':
        fileTabRef.current?.openAddDialog()
        break
      case 'publishing':
        publishingTabRef.current?.openAddDialog()
        break
    }
  }

  const currentTabConfig = TAB_CONFIG[currentTab]

  return (
    <PageLayout
      icon={pageIcon}
      title="리소스 관리"
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleAdd} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentTabConfig.addTooltip}</p>
          </TooltipContent>
        </Tooltip>
      }
    >
      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          {(Object.keys(TAB_CONFIG) as TabType[]).map((tabKey) => {
            const config = TAB_CONFIG[tabKey]
            const Icon = config.icon
            return (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="services" className="mt-10">
          <ServiceTab ref={serviceTabRef} />
        </TabsContent>

        <TabsContent value="links" className="mt-10">
          <LinkResourceTab ref={linkTabRef} />
        </TabsContent>

        <TabsContent value="files" className="mt-10">
          <FileResourceTab ref={fileTabRef} />
        </TabsContent>

        <TabsContent value="publishing" className="mt-10">
          <PublishingTab ref={publishingTabRef} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
