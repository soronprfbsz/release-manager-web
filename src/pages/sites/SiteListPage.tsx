/**
 * Site List Page
 * 사이트 목록 페이지 - 리스트 뷰 + 상세 패널
 */

import { useState, useEffect, useMemo, useRef } from 'react'

import { Plus, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import {
  SiteForm,
  SiteDeleteModal,
  SiteList,
  SiteDetailPanel,
  DEFAULT_SITE_CATEGORY,
  type SiteFormData,
  type SiteFormMode,
  type SiteFilter,
  validateSiteForm,
} from '@/features/sites/site-management'

import {
  useSites,
  useCreateSite,
  useUpdateSite,
  useDeleteSite,
  type Site,
} from '@/entities/sites'

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { ContentSplit } from '@/shared/ui/content-layout'
import { Input } from '@/shared/ui/input'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tabs, TabsBar, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const INITIAL_FORM_DATA: SiteFormData = {
  siteCode: '',
  siteName: '',
  siteCategory: DEFAULT_SITE_CATEGORY,
  description: '',
  isActive: true,
  projectId: '',
  glyphText: '',
  glyphBackgroundColor: '',
}

export function SiteListPage() {
  const { toast } = useToast()
  const { canCreateSite, canEditSite, canDeleteSite } = usePermission()
  const { projectId } = useProjectStore()

  // Selected site
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)

  // Form state
  const [modalMode, setModalMode] = useState<SiteFormMode>(null)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [formData, setFormData] = useState<SiteFormData>(INITIAL_FORM_DATA)

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  // Filter tab state (표준 / 커스텀)
  const [siteFilter, setSiteFilter] = useState<SiteFilter>('standard')

  // 프로젝트 변경 시 선택된 사이트 초기화
  useEffect(() => {
    setSelectedSiteId(null)
  }, [projectId])

  // 홈의 "최근 적용 패치" 등에서 ?siteId=N 으로 진입한 경우 해당 사이트를 선택한다.
  // 진입 시 1회만 소비한다(appliedRef) — 이후 사용자가 다른 사이트를 골라도 URL 은 건드리지 않고,
  // 프로젝트를 바꿔 목록이 다시 로드돼도 URL 의 사이트로 되돌아가지 않는다.
  // 탭은 링크 쪽에서 지정할 수 없다: 표준/커스텀 구분은 사이트의 hasCustomVersion 이고
  // 패치의 releaseType 과 다르므로(커스텀 사이트도 표준 패치를 받는다) 여기서 판정한다.
  // 목록에 없으면(다른 프로젝트 / 삭제됨) 아무것도 하지 않는다.
  const [searchParams] = useSearchParams()
  const urlSiteId = searchParams.get('siteId')
  const appliedRef = useRef(false)

  // Query for sites
  const { data: sitesData, isLoading } = useSites({
    size: 10000,
    projectId: projectId || undefined,
  })

  // Mutations
  const createMutation = useCreateSite()
  const updateMutation = useUpdateSite()
  const deleteMutation = useDeleteSite()

  // Derived data
  const sites = useMemo(() => sitesData?.content || [], [sitesData])
  const selectedSite = sites.find((c) => c.siteId === selectedSiteId) || null

  useEffect(() => {
    if (appliedRef.current || !urlSiteId) return
    const target = sites.find((c) => c.siteId === Number(urlSiteId))
    if (!target) return

    appliedRef.current = true
    setSiteFilter(target.hasCustomVersion ? 'custom' : 'standard')
    setSelectedSiteId(target.siteId)
  }, [urlSiteId, sites])

  // 이름 ASC 정렬 후 표준/커스텀 분류
  const { standardSites, customSites } = useMemo(() => {
    const sorted = [...sites].sort((a, b) =>
      a.siteName.localeCompare(b.siteName)
    )
    return {
      standardSites: sorted.filter((c) => !c.hasCustomVersion),
      customSites: sorted.filter((c) => c.hasCustomVersion),
    }
  }, [sites])

  // 현재 탭 + 검색어가 적용된 표시 목록
  const displayedSites = useMemo(() => {
    const base = siteFilter === 'standard' ? standardSites : customSites
    const term = searchTerm.trim().toLowerCase()
    if (!term) return base
    return base.filter(
      (c) =>
        c.siteName.toLowerCase().includes(term) ||
        c.siteCode.toLowerCase().includes(term)
    )
  }, [siteFilter, standardSites, customSites, searchTerm])

  // Handlers
  const openCreateModal = () => {
    setFormData({ ...INITIAL_FORM_DATA, projectId: projectId || '' })
    setEditingSite(null)
    setModalMode('create')
  }

  const openEditModal = (site: Site) => {
    setFormData({
      siteCode: site.siteCode,
      siteName: site.siteName,
      siteCategory: site.siteCategory,
      description: site.description || '',
      isActive: site.isActive,
      projectId: site.project?.projectId || '',
      glyphText: site.glyphText || '',
      glyphBackgroundColor: site.glyphBackgroundColor || '',
    })
    setEditingSite(site)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingSite(null)
    setFormData(INITIAL_FORM_DATA)
  }

  const handleSubmit = () => {
    const validation = validateSiteForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    if (modalMode === 'create') {
      createMutation.mutate(
        {
          siteCode: formData.siteCode.trim(),
          siteName: formData.siteName.trim(),
          siteCategory: formData.siteCategory,
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          projectId: formData.projectId || undefined,
          glyphText: formData.glyphText,
          glyphBackgroundColor: formData.glyphBackgroundColor,
        },
        {
          onSuccess: () => {
            toast({ title: '사이트 생성 완료', description: '새 사이트가 등록되었습니다.' })
            closeModal()
          },
          onError: createErrorHandler(toast, '생성 실패'),
        }
      )
    } else if (modalMode === 'edit' && editingSite) {
      updateMutation.mutate(
        {
          id: editingSite.siteId,
          data: {
            siteName: formData.siteName.trim(),
            siteCategory: formData.siteCategory,
            description: formData.description.trim() || undefined,
            isActive: formData.isActive,
            glyphText: formData.glyphText,
            glyphBackgroundColor: formData.glyphBackgroundColor,
          },
        },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '사이트 정보가 수정되었습니다.' })
            closeModal()
          },
          onError: createErrorHandler(toast, '수정 실패'),
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          toast({ title: '삭제 완료', description: '사이트가 삭제되었습니다.' })
          setDeleteConfirmId(null)
          if (selectedSiteId === deleteConfirmId) {
            setSelectedSiteId(null)
          }
        },
        onError: createErrorHandler(toast, '삭제 실패'),
      })
    }
  }

  const handleSiteSelect = (site: Site) => {
    setSelectedSiteId(site.siteId)
  }

  return (
    <PageLayout
      fullHeight
      actions={
        canCreateSite ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={openCreateModal} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>사이트 생성</p>
            </TooltipContent>
          </Tooltip>
        ) : null
      }
    >
      <ContentSplit treeWidth={25}>
        {/* Left Panel - Site List */}
        <ContentSplit.Tree
          rawHeader
          header={
            <Tabs
              value={siteFilter}
              onValueChange={(value) => setSiteFilter(value as SiteFilter)}
            >
              {/* 우측 상세 패널의 타이틀 밴드와 같은 무채색 띠 */}
              <TabsBar className="pl-3 pr-3 bg-muted">
                {/* 표준 / 커스텀 필터 탭 */}
                <TabsList variant="line" className="w-auto h-auto">
                  <TabsTrigger variant="line" value="standard" className="group px-3 py-4">
                    표준
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold tabular-nums bg-muted text-muted-foreground transition-colors group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary">
                      {standardSites.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger variant="line" value="custom" className="group px-3 py-4">
                    커스텀
                    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold tabular-nums bg-muted text-muted-foreground transition-colors group-data-[state=active]:bg-primary/20 group-data-[state=active]:text-primary">
                      {customSites.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* 검색 */}
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="사이트명 또는 코드 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-8 h-8 text-xs"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TabsBar>
            </Tabs>
          }
        >
          <SiteList
            sites={displayedSites}
            filter={siteFilter}
            totalCount={sites.length}
            hasSearch={Boolean(searchTerm.trim())}
            selectedId={selectedSiteId}
            isLoading={isLoading}
            onSelect={handleSiteSelect}
            onEdit={canEditSite ? openEditModal : undefined}
            onDelete={canDeleteSite ? (site) => setDeleteConfirmId(site.siteId) : undefined}
          />
        </ContentSplit.Tree>

        {/* Right Panel - Site Detail (헤더는 패널 내부에서 Hero+Meta Rail 형태로) */}
        <ContentSplit.Detail
          title="사이트 상세"
          actions={
            selectedSite ? (
              <span className="text-xs text-muted-foreground">{selectedSite.siteCode}</span>
            ) : undefined
          }
          /* 좌측 트리는 rawHeader 로 탭바(py-4 + h-5 배지 = 52px + border)를 직접 그린다.
             밴드 기본 높이(44px)로는 두 패널의 어깨가 어긋나므로 그 높이에 맞춘다. */
          headerClassName="min-h-[53px]"
          isEmpty={!selectedSite}
          emptyMessage="사이트를 선택해주세요."
        >
          {selectedSite && (
            <SiteDetailPanel site={selectedSite} />
          )}
        </ContentSplit.Detail>
      </ContentSplit>

      {/* Form Sheet */}
      <SiteForm
        mode={modalMode}
        formData={formData}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        editingSite={editingSite}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Delete Modal */}
      <SiteDeleteModal
        isOpen={deleteConfirmId !== null}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmId(null)}
      />
    </PageLayout>
  )
}
