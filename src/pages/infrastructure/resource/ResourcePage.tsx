/**
 * Resource Page
 * 리소스 관리 페이지 - 서비스, 링크, 파일 등 탭 조합
 */

import { useRef, useState } from 'react'

import { Plus, Search } from 'lucide-react'

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

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { PUBLISHING_CATEGORIES } from '@/features/infrastructure/publishing-management'
import type { ServiceFiltersState } from '@/features/infrastructure/service-management'
import type { LinkFiltersState } from '@/features/infrastructure/link-management'
import type { FileFiltersState } from '@/features/infrastructure/file-management'
import type { PublishingFiltersState } from '@/features/infrastructure/publishing-management'

import { usePageIcon } from '@/shared/lib/hooks'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
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

  // Filter states for each tab
  const [serviceFilters, setServiceFilters] = useState<ServiceFiltersState>({
    serviceType: 'all',
    keyword: '',
  })
  const [linkFilters, setLinkFilters] = useState<LinkFiltersState>({
    category: '',
    keyword: '',
  })
  const [fileFilters, setFileFilters] = useState<FileFiltersState>({
    category: '',
    keyword: '',
  })
  const [publishingFilters, setPublishingFilters] = useState<PublishingFiltersState>({
    keyword: '',
    publishingCategory: '',
  })

  // Code data for service type filter
  const { data: serviceTypes = [] } = useCodesByType(CODE_TYPE.SERVICE_TYPE)

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

  // Get current keyword based on active tab
  const getCurrentKeyword = () => {
    switch (currentTab) {
      case 'services':
        return serviceFilters.keyword
      case 'links':
        return linkFilters.keyword
      case 'files':
        return fileFilters.keyword
      case 'publishing':
        return publishingFilters.keyword
      default:
        return ''
    }
  }

  // Set current keyword based on active tab
  const setCurrentKeyword = (keyword: string) => {
    switch (currentTab) {
      case 'services':
        setServiceFilters((prev) => ({ ...prev, keyword }))
        break
      case 'links':
        setLinkFilters((prev) => ({ ...prev, keyword }))
        break
      case 'files':
        setFileFilters((prev) => ({ ...prev, keyword }))
        break
      case 'publishing':
        setPublishingFilters((prev) => ({ ...prev, keyword }))
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
        {/* Tab Header with integrated filters */}
        <div className="flex items-center justify-between">
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

          {/* Integrated Filters */}
          <div className="flex items-center gap-2">
            {/* Category Select - only for services and publishing */}
            {currentTab === 'services' && (
              <Select
                value={serviceFilters.serviceType}
                onValueChange={(value) =>
                  setServiceFilters((prev) => ({
                    ...prev,
                    serviceType: value as ServiceFiltersState['serviceType'],
                  }))
                }
              >
                <SelectTrigger className="h-8 w-[120px] text-xs bg-muted/50 border-0">
                  <SelectValue placeholder="서비스 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {currentTab === 'publishing' && (
              <Select
                value={publishingFilters.publishingCategory || 'all'}
                onValueChange={(value) =>
                  setPublishingFilters((prev) => ({
                    ...prev,
                    publishingCategory: value === 'all' ? '' : value,
                  }))
                }
              >
                <SelectTrigger className="h-8 w-[120px] text-xs bg-muted/50 border-0">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {PUBLISHING_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={getCurrentKeyword()}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                placeholder="검색..."
                className="pl-8 h-8 w-[200px] text-xs bg-muted/50 border-0"
              />
            </div>
          </div>
        </div>

        <TabsContent value="services">
          <ServiceTab ref={serviceTabRef} filters={serviceFilters} />
        </TabsContent>

        <TabsContent value="links">
          <LinkResourceTab ref={linkTabRef} filters={linkFilters} />
        </TabsContent>

        <TabsContent value="files">
          <FileResourceTab ref={fileTabRef} filters={fileFilters} />
        </TabsContent>

        <TabsContent value="publishing">
          <PublishingTab ref={publishingTabRef} filters={publishingFilters} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
