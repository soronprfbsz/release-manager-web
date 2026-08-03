/**
 * Resource Page
 * 리소스 관리 페이지 - 서비스, 링크, 파일 등 탭 조합
 */

import React, { useRef, useState, useMemo } from 'react'

import { Plus, Search, FolderPlus, X, ArrowUpDown } from 'lucide-react'
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
} from '@/widgets/sharing/resource'


import type { FileFiltersState } from '@/features/sharing/file-management'
import type { LinkFiltersState } from '@/features/sharing/link-management'
import { PUBLISHING_CATEGORIES } from '@/features/sharing/publishing-management'
import type { PublishingFiltersState } from '@/features/sharing/publishing-management'
import type { ServiceFiltersState } from '@/features/sharing/service-management'

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { FILE_SORT_OPTIONS } from '@/shared/lib/utils/file-sort'
import { Button } from '@/shared/ui/button'
import { TabbedContentCard, type TabbedTab } from '@/shared/ui/content-layout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    canManageService,
    canManageLink,
    canManageFile,
    canCreatePublishing,
    canEditPublishing,
    canDeletePublishing,
  } = usePermission()

  // 권한에 따라 접근 가능한 탭 필터링
  const TAB_PERMISSION: Record<TabType, boolean> = useMemo(() => ({
    services: canManageService,
    links: canManageLink,
    files: canManageFile,
    publishing: true, // 퍼블리싱은 모든 인증 사용자 조회 가능
  }), [canManageService, canManageLink, canManageFile])

  const visibleTabs = useMemo(
    () => (Object.keys(TAB_CONFIG) as TabType[]).filter((key) => TAB_PERMISSION[key]),
    [TAB_PERMISSION]
  )

  const paramTab = searchParams.get('tab') as TabType | null
  const currentTab = paramTab && visibleTabs.includes(paramTab) ? paramTab : visibleTabs[0] || 'publishing'

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
    sortBy: 'name',
    sortDirection: 'asc',
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
        // 파일 탭은 카테고리별 추가 버튼이 있으므로 여기서는 처리하지 않음
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
      actions={
        currentTab === 'files' && canManageFile ? (
          // 파일 탭: 카테고리 생성 드롭다운
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fileTabRef.current?.openCategoryCreate()}>
                <FolderPlus className="h-4 w-4 mr-2" />
                카테고리 생성
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (currentTab === 'services' && canManageService) ||
             (currentTab === 'links' && canManageLink) ||
             (currentTab === 'publishing' && canCreatePublishing) ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAdd} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentTabConfig.addTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : null
      }
    >
      {/* 탭 통합 필터 — TabsBar 우측 슬롯 */}
      <TabbedContentCard
        value={currentTab}
        onValueChange={handleTabChange}
        tabs={
          (visibleTabs.map((tabKey) => {
            const config = TAB_CONFIG[tabKey]
            const tabContentMap: Record<TabType, React.ReactNode> = {
              services: <ServiceTab ref={serviceTabRef} filters={serviceFilters} />,
              links: <LinkResourceTab ref={linkTabRef} filters={linkFilters} />,
              files: <FileResourceTab ref={fileTabRef} filters={fileFilters} />,
              publishing: (
                <PublishingTab
                  ref={publishingTabRef}
                  filters={publishingFilters}
                  canEdit={canEditPublishing}
                  canDelete={canDeletePublishing}
                />
              ),
            }
            return {
              value: tabKey,
              label: config.label,
              icon: config.icon,
              content: tabContentMap[tabKey],
            } satisfies TabbedTab
          }) as TabbedTab[])
        }
        headerRight={
          /* 탭별 필터 + 검색 */
          <div className="flex items-center gap-2">
            {/* 서비스 탭: 서비스 타입 Select */}
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

            {/* 퍼블리싱 탭: 카테고리 Select */}
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

            {/* 파일 탭: 정렬 Select */}
            {currentTab === 'files' && (
              <Select
                value={`${fileFilters.sortBy}-${fileFilters.sortDirection}`}
                onValueChange={(value) => {
                  const option = FILE_SORT_OPTIONS.find((opt) => opt.value === value)
                  if (option) {
                    setFileFilters((prev) => ({
                      ...prev,
                      sortBy: option.sortBy,
                      sortDirection: option.direction,
                    }))
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs bg-muted/50 border-0">
                  <ArrowUpDown className="h-3 w-3 mr-1.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 검색 Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={getCurrentKeyword()}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                placeholder="검색..."
                className="pl-8 pr-8 h-8 w-[200px] text-xs bg-muted/50 border-0"
              />
              {getCurrentKeyword() && (
                <button
                  type="button"
                  onClick={() => setCurrentKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        }
      />
    </PageLayout>
  )
}
