/**
 * Resource Page
 * 리소스 관리 페이지 - 서비스, 링크, 파일 탭 조합
 */

import { useRef } from 'react'

import { Plus, RefreshCw, Server, Link as LinkIcon, FolderOpen } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import {
  ServiceTab,
  type ServiceTabHandle,
  LinkResourceTab,
  type LinkResourceTabHandle,
  FileResourceTab,
  type FileResourceTabHandle,
} from '@/widgets/infrastructure/resource'

import { getPageIconById } from '@/shared/config/menu-icons'
import { Button } from '@/shared/ui/button'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type TabType = 'services' | 'links' | 'files'

const TAB_CONFIG = {
  services: {
    icon: Server,
    label: '서비스',
    addTooltip: '서비스 추가',
  },
  links: {
    icon: LinkIcon,
    label: '링크',
    addTooltip: '링크 추가',
  },
  files: {
    icon: FolderOpen,
    label: '파일',
    addTooltip: '파일 업로드',
  },
} as const

export function ResourcePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabType) || 'services'

  // Refs for tab components
  const serviceTabRef = useRef<ServiceTabHandle>(null)
  const linkTabRef = useRef<LinkResourceTabHandle>(null)
  const fileTabRef = useRef<FileResourceTabHandle>(null)

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleRefresh = () => {
    switch (currentTab) {
      case 'services':
        serviceTabRef.current?.refresh()
        break
      case 'links':
        linkTabRef.current?.refresh()
        break
      case 'files':
        fileTabRef.current?.refresh()
        break
    }
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
    }
  }

  const currentTabConfig = TAB_CONFIG[currentTab]

  return (
    <PageLayout
      icon={getPageIconById('infrastructure_resources')}
      title="리소스 관리"
      actions={
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleRefresh} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>새로고침</p>
            </TooltipContent>
          </Tooltip>
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
        </>
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

        <TabsContent value="services" className="mt-8">
          <ServiceTab ref={serviceTabRef} />
        </TabsContent>

        <TabsContent value="links" className="mt-8">
          <LinkResourceTab ref={linkTabRef} />
        </TabsContent>

        <TabsContent value="files" className="mt-8">
          <FileResourceTab ref={fileTabRef} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
