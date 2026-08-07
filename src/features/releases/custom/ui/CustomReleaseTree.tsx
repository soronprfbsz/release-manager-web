import { useState, useEffect, useMemo } from 'react'

import { ChevronRight, ChevronDown, Tag, Building2, Zap, Wrench, Sparkles, Trash2, CheckCircle2 } from 'lucide-react'

import type { SiteReleaseNode } from '@/entities/releases/release'

import { cn } from '@/shared/lib/utils'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { findLatestVersionIdBySite } from '@/shared/lib/utils/version'
import { Badge } from '@/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  TreeActionMenu,
  TreeActionMenuItem,
  TreeActionMenuSeparator,
} from '@/shared/ui/tree-action-menu'

/** 최신 버전 표시용 아이콘 */
function LatestIndicator() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        최신 버전
      </TooltipContent>
    </Tooltip>
  )
}

/** 핫픽스 배지 */
function HotfixBadge() {
  return (
    <Badge
      variant="destructive"
      className="text-[10px] px-1 py-0 h-4 leading-none"
    >
      HOTFIX
    </Badge>
  )
}

/** 선택된 노드 정보 */
export interface SelectedCustomVersionInfo {
  versionId: number
  version: string
  isHotfix: boolean
  siteCode: string
  customBaseVersion: string | null
  /** 빌드 여부 */
  isBuild?: boolean
  /** 빌드 base 버전 (예: 1.0.0) */
  buildBaseVersion?: string
}

interface CustomReleaseTreeProps {
  sites: SiteReleaseNode[]
  selectedVersionId: number | null
  onSelectVersion: (info: SelectedCustomVersionInfo) => void
  /** 핫픽스 생성 콜백 */
  onHotfix?: (versionId: number, version: string, siteCode: string) => void
  /** 빌드 생성 콜백 */
  onBuild?: (versionId: number, version: string, siteCode: string) => void
  /** 삭제 콜백 */
  onDelete?: (versionId: number, version: string, isHotfix: boolean) => void
  /** 승인 콜백 (미승인 버전/핫픽스에서만 표시) */
  onApprove?: (versionId: number, version: string) => void
  /** 핫픽스/빌드 생성 권한 */
  canAddVersion?: boolean
  /** 삭제 권한 */
  canDeleteVersion?: boolean
  /** 승인 권한 */
  canApproveVersion?: boolean
}

export function CustomReleaseTree({
  sites,
  selectedVersionId,
  onSelectVersion,
  onHotfix,
  onBuild,
  onDelete,
  onApprove,
  canAddVersion = false,
  canDeleteVersion = false,
  canApproveVersion = false,
}: CustomReleaseTreeProps) {
  const showActions = canAddVersion || canDeleteVersion || canApproveVersion
  const [expandedSites, setExpandedSites] = useState<Set<string>>(() => {
    return new Set(sites.map(c => c.siteCode))
  })
  // 핫픽스가 있는 버전들의 확장 상태
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set())

  // 사이트별 최신 버전 ID 맵
  const latestVersionMap = useMemo(() => findLatestVersionIdBySite(sites), [sites])

  // major.minor 그룹 확장 상태 — 최초 마운트 시 사이트별 최신 버전이 속한 그룹만 펼침
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const site of sites) {
      const latestId = latestVersionMap.get(site.siteCode)
      if (latestId == null) continue
      for (const group of site.majorMinorGroups) {
        if (group.versions.some((v) => v.versionId === latestId)) {
          initial.add(`${site.siteCode}-${group.majorMinor}`)
          break
        }
      }
    }
    return initial
  })

  useEffect(() => {
    if (sites.length > 0) {
      setExpandedSites(new Set(sites.map(c => c.siteCode)))
    }
  }, [sites])

  // selectedVersionId 가 빌드/핫픽스 노드인 경우 부모(표준 버전) 자동 expand
  useEffect(() => {
    if (selectedVersionId == null) return
    for (const site of sites) {
      for (const group of site.majorMinorGroups) {
        for (const version of group.versions) {
          const hasChildMatch =
            version.hotfixes?.some((h) => h.versionId === selectedVersionId) ||
            version.builds?.some((b) => b.versionId === selectedVersionId)
          if (hasChildMatch) {
            setExpandedVersions((prev) => {
              if (prev.has(version.versionId)) return prev
              const next = new Set(prev)
              next.add(version.versionId)
              return next
            })
            return
          }
        }
      }
    }
  }, [selectedVersionId, sites])

  // selectedVersionId 가 접힌 그룹 안의 버전(또는 그 하위 build/hotfix)이면 해당 그룹 자동 expand
  useEffect(() => {
    if (selectedVersionId == null) return
    for (const site of sites) {
      for (const group of site.majorMinorGroups) {
        const hasMatch = group.versions.some((version) =>
          version.versionId === selectedVersionId ||
          version.hotfixes?.some((h) => h.versionId === selectedVersionId) ||
          version.builds?.some((b) => b.versionId === selectedVersionId)
        )
        if (hasMatch) {
          const groupKey = `${site.siteCode}-${group.majorMinor}`
          setExpandedGroups((prev) => {
            if (prev.has(groupKey)) return prev
            const next = new Set(prev)
            next.add(groupKey)
            return next
          })
          return
        }
      }
    }
  }, [selectedVersionId, sites])

  const toggleSite = (siteCode: string) => {
    setExpandedSites((prev) => {
      const next = new Set(prev)
      if (next.has(siteCode)) {
        next.delete(siteCode)
      } else {
        next.add(siteCode)
      }
      return next
    })
  }

  const toggleVersion = (versionId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedVersions((prev) => {
      const next = new Set(prev)
      if (next.has(versionId)) {
        next.delete(versionId)
      } else {
        next.add(versionId)
      }
      return next
    })
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-muted-foreground">
        <p className="text-sm">릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sites.map((site) => {
        const isSiteExpanded = expandedSites.has(site.siteCode)
        const siteVersionCount = site.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0)

        return (
          <div key={site.siteCode}>
            {/* Site Level */}
            <button
              onClick={() => toggleSite(site.siteCode)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
            >
              {isSiteExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-medium truncate" title={site.siteName}>
                {site.siteName}
              </span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                ({siteVersionCount})
              </span>
            </button>

            {isSiteExpanded && (
              <div className="ml-4 pl-2 border-l border-border space-y-4 mt-1">
                {site.majorMinorGroups.map((group) => {
                  const groupKey = `${site.siteCode}-${group.majorMinor}`
                  const isGroupExpanded = expandedGroups.has(groupKey)

                  return (
                    <div key={groupKey}>
                      {/* Major.Minor 그룹 헤더 — 표준 탭과 동일한 uppercase 평문 라벨 */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="flex items-center gap-1.5 w-full px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isGroupExpanded ? (
                          <ChevronDown className="h-3 w-3 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3 w-3 shrink-0" />
                        )}
                        {group.majorMinor.toUpperCase()}
                      </button>

                      {isGroupExpanded && (
                      <div className="space-y-0.5">
                          {group.versions.map((version) => {
                            const hasHotfixes = version.hotfixes && version.hotfixes.length > 0
                            const hasBuilds = version.builds && version.builds.length > 0
                            const hasChildren = hasHotfixes || hasBuilds
                            const isVersionExpanded = expandedVersions.has(version.versionId)

                            return (
                              <div key={version.versionId}>
                                <div
                                  className={cn(
                                    'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                                    selectedVersionId === version.versionId
                                      ? 'bg-primary/20 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                                      : 'hover:bg-accent'
                                  )}
                                  onClick={() => onSelectVersion({
                                    versionId: version.versionId,
                                    version: version.version,
                                    isHotfix: false,
                                    siteCode: site.siteCode,
                                    customBaseVersion: site.customBaseVersion
                                  })}
                                >
                                  {/* 자식(핫픽스/빌드)이 있는 경우 확장 버튼 */}
                                  {hasChildren ? (
                                    <button
                                      onClick={(e) => toggleVersion(version.versionId, e)}
                                      className="p-0.5 rounded shrink-0"
                                    >
                                      {isVersionExpanded ? (
                                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="w-4" />
                                  )}
                                  <div className="flex items-center gap-2 flex-1 text-left text-sm">
                                    <Tag className={cn(
                                      "h-4 w-4 shrink-0",
                                      version.isApproved ? "text-blue-500" : "text-muted-foreground"
                                    )} />
                                    <span className={cn(
                                      "flex-shrink-0",
                                      !version.isApproved && "text-muted-foreground italic opacity-60"
                                    )}>
                                      {version.version}
                                    </span>
                                    {latestVersionMap.get(site.siteCode) === version.versionId && <LatestIndicator />}
                                    <div className="flex gap-1 ml-auto items-center">
                                      {version.fileCategories && version.fileCategories.length > 0 && (
                                        <>
                                          {version.fileCategories.map((category) => (
                                            <Badge
                                              key={category}
                                              variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                                              className="text-[10px] px-1 py-0 h-4 leading-none"
                                            >
                                              {getCategoryShortName(category)}
                                            </Badge>
                                          ))}
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* 액션 메뉴 (일반 버전) */}
                                  {showActions && (
                                    <TreeActionMenu>
                                      {canApproveVersion && !version.isApproved && (
                                        <>
                                          <TreeActionMenuItem
                                            onClick={() => onApprove?.(version.versionId, version.version)}
                                          >
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                            승인
                                          </TreeActionMenuItem>
                                          <TreeActionMenuSeparator />
                                        </>
                                      )}
                                      {canAddVersion && (
                                        <TreeActionMenuItem onClick={() => onHotfix?.(version.versionId, version.version, site.siteCode)}>
                                          <Zap className="h-4 w-4 mr-2 text-amber-500" />
                                          핫픽스 생성
                                        </TreeActionMenuItem>
                                      )}
                                      {canAddVersion && (
                                        <TreeActionMenuItem onClick={() => onBuild?.(version.versionId, version.version, site.siteCode)}>
                                          <Wrench className="h-4 w-4 mr-2 text-sky-400" />
                                          빌드 생성
                                        </TreeActionMenuItem>
                                      )}
                                      {canAddVersion && canDeleteVersion && <TreeActionMenuSeparator />}
                                      {canDeleteVersion && (
                                        <TreeActionMenuItem
                                          destructive
                                          onClick={() => onDelete?.(version.versionId, version.version, false)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          삭제
                                        </TreeActionMenuItem>
                                      )}
                                    </TreeActionMenu>
                                  )}
                                </div>

                                {/* 핫픽스 / 빌드 목록 (확장 시) */}
                                {hasChildren && isVersionExpanded && (
                                  <div className="ml-6 pl-2 border-l border-border/50">
                                    {/* 핫픽스 */}
                                    {hasHotfixes && version.hotfixes.map((hotfix) => (
                                      <div
                                        key={`hotfix-${hotfix.versionId}`}
                                        className={cn(
                                          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                                          selectedVersionId === hotfix.versionId
                                            ? 'bg-primary/20 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                                            : 'hover:bg-accent'
                                        )}
                                        onClick={() => onSelectVersion({
                                          versionId: hotfix.versionId,
                                          version: hotfix.fullVersion,
                                          isHotfix: true,
                                          siteCode: site.siteCode,
                                          customBaseVersion: site.customBaseVersion
                                        })}
                                      >
                                        <div className="flex items-center gap-2 flex-1 text-left text-sm">
                                          <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                                          <span className={cn(
                                            "flex-shrink-0",
                                            hotfix.isApproved === false && "text-muted-foreground italic opacity-60"
                                          )}>
                                            {hotfix.fullVersion}
                                          </span>
                                          <div className="flex gap-1 ml-auto items-center">
                                            {hotfix.fileCategories && hotfix.fileCategories.length > 0 ? (
                                              <>
                                                {hotfix.fileCategories.map((category) => (
                                                  <Badge
                                                    key={category}
                                                    variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                                                    className="text-[10px] px-1 py-0 h-4 leading-none"
                                                  >
                                                    {getCategoryShortName(category)}
                                                  </Badge>
                                                ))}
                                              </>
                                            ) : (
                                              <HotfixBadge />
                                            )}
                                          </div>
                                        </div>

                                        {/* 액션 메뉴 (핫픽스) */}
                                        {showActions && (canDeleteVersion || canApproveVersion) && (
                                          <TreeActionMenu>
                                            {canApproveVersion && hotfix.isApproved === false && (
                                              <>
                                                <TreeActionMenuItem
                                                  onClick={() => onApprove?.(hotfix.versionId, hotfix.fullVersion)}
                                                >
                                                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                                                  승인
                                                </TreeActionMenuItem>
                                                {canDeleteVersion && <TreeActionMenuSeparator />}
                                              </>
                                            )}
                                            {canDeleteVersion && (
                                              <TreeActionMenuItem
                                                destructive
                                                onClick={() => onDelete?.(hotfix.versionId, hotfix.fullVersion, true)}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                삭제
                                              </TreeActionMenuItem>
                                            )}
                                          </TreeActionMenu>
                                        )}
                                      </div>
                                    ))}

                                    {/* 빌드 */}
                                    {hasBuilds && version.builds!.map((build) => (
                                      <div
                                        key={`build-${build.versionId}`}
                                        className={cn(
                                          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                                          selectedVersionId === build.versionId
                                            ? 'bg-primary/20 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                                            : 'hover:bg-accent'
                                        )}
                                        onClick={() => onSelectVersion({
                                          versionId: build.versionId,
                                          version: build.fullVersion,
                                          isHotfix: false,
                                          isBuild: true,
                                          buildBaseVersion: version.version,
                                          siteCode: site.siteCode,
                                          customBaseVersion: site.customBaseVersion,
                                        })}
                                      >
                                        <div className="flex items-center gap-2 flex-1 text-left text-sm">
                                          <Wrench className="h-4 w-4 shrink-0 text-sky-400" />
                                          <span className="flex-shrink-0">
                                            {build.fullVersion}
                                          </span>
                                          <div className="flex gap-1 ml-auto items-center">
                                            {build.fileCategories && build.fileCategories.length > 0 && (
                                              <>
                                                {build.fileCategories.map((category) => (
                                                  <Badge
                                                    key={category}
                                                    variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                                                    className="text-[10px] px-1 py-0 h-4 leading-none"
                                                  >
                                                    {getCategoryShortName(category)}
                                                  </Badge>
                                                ))}
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* 액션 메뉴 (빌드) */}
                                        {showActions && canDeleteVersion && (
                                          <TreeActionMenu>
                                            <TreeActionMenuItem
                                              destructive
                                              onClick={() => onDelete?.(build.versionId, build.fullVersion, false)}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              삭제
                                            </TreeActionMenuItem>
                                          </TreeActionMenu>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
