import { useState, useEffect, useMemo } from 'react'

import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Building2, Flame, Hammer, Star, Trash2 } from 'lucide-react'

import type { CustomerReleaseNode } from '@/entities/releases/release'

import { cn } from '@/shared/lib/utils'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { findLatestVersionIdByCustomer } from '@/shared/lib/utils/version'
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
        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 relative top-[1px]" />
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
  customerCode: string
  customBaseVersion: string | null
  /** 빌드 여부 */
  isBuild?: boolean
  /** 빌드 base 버전 (예: 1.0.0) */
  buildBaseVersion?: string
}

interface CustomReleaseTreeProps {
  customers: CustomerReleaseNode[]
  selectedVersionId: number | null
  onSelectVersion: (info: SelectedCustomVersionInfo) => void
  /** 핫픽스 생성 콜백 */
  onHotfix?: (versionId: number, version: string, customerCode: string) => void
  /** 빌드 생성 콜백 */
  onBuild?: (versionId: number, version: string, customerCode: string) => void
  /** 삭제 콜백 */
  onDelete?: (versionId: number, version: string, isHotfix: boolean) => void
  /** 핫픽스/빌드 생성 권한 */
  canAddVersion?: boolean
  /** 삭제 권한 */
  canDeleteVersion?: boolean
}

export function CustomReleaseTree({
  customers,
  selectedVersionId,
  onSelectVersion,
  onHotfix,
  onBuild,
  onDelete,
  canAddVersion = false,
  canDeleteVersion = false,
}: CustomReleaseTreeProps) {
  const showActions = canAddVersion || canDeleteVersion
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(() => {
    return new Set(customers.map(c => c.customerCode))
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const allGroups = new Set<string>()
    customers.forEach(customer => {
      customer.majorMinorGroups.forEach(group => {
        allGroups.add(`${customer.customerCode}-${group.majorMinor}`)
      })
    })
    return allGroups
  })
  // 핫픽스가 있는 버전들의 확장 상태
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set())

  // 고객사별 최신 버전 ID 맵
  const latestVersionMap = useMemo(() => findLatestVersionIdByCustomer(customers), [customers])

  useEffect(() => {
    if (customers.length > 0) {
      setExpandedCustomers(new Set(customers.map(c => c.customerCode)))
      const allGroups = new Set<string>()
      customers.forEach(customer => {
        customer.majorMinorGroups.forEach(group => {
          allGroups.add(`${customer.customerCode}-${group.majorMinor}`)
        })
      })
      setExpandedGroups(allGroups)
    }
  }, [customers])

  const toggleCustomer = (customerCode: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev)
      if (next.has(customerCode)) {
        next.delete(customerCode)
      } else {
        next.add(customerCode)
      }
      return next
    })
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
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

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-26rem)] text-muted-foreground">
        <p className="text-sm">릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {customers.map((customer) => {
        const isCustomerExpanded = expandedCustomers.has(customer.customerCode)
        const customerVersionCount = customer.majorMinorGroups.reduce((acc, g) => acc + g.versions.length, 0)

        return (
          <div key={customer.customerCode}>
            {/* Customer Level */}
            <button
              onClick={() => toggleCustomer(customer.customerCode)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
            >
              {isCustomerExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="font-medium truncate" title={customer.customerName}>
                {customer.customerName}
              </span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                ({customerVersionCount})
              </span>
            </button>

            {isCustomerExpanded && (
              <div className="ml-4 pl-2 border-l border-border">
                {customer.majorMinorGroups.map((group) => {
                  const groupKey = `${customer.customerCode}-${group.majorMinor}`
                  const isGroupExpanded = expandedGroups.has(groupKey)

                  return (
                    <div key={groupKey}>
                      {/* Major.Minor Level */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
                      >
                        {isGroupExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {isGroupExpanded ? (
                          <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
                        ) : (
                          <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                        <span className="font-medium">{group.majorMinor}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          ({group.versions.length})
                        </span>
                      </button>

                      {isGroupExpanded && (
                        <div className="ml-4 pl-2 border-l border-border">
                          {group.versions.map((version) => {
                            const hasHotfixes = version.hotfixes && version.hotfixes.length > 0
                            const hasBuilds = version.builds && version.builds.length > 0
                            const hasChildren = hasHotfixes || hasBuilds
                            const isVersionExpanded = expandedVersions.has(version.versionId)

                            return (
                              <div key={version.versionId}>
                                <div
                                  className={cn(
                                    'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                                    'hover:bg-accent',
                                    selectedVersionId === version.versionId && 'bg-accent'
                                  )}
                                  onClick={() => onSelectVersion({
                                    versionId: version.versionId,
                                    version: version.version,
                                    isHotfix: false,
                                    customerCode: customer.customerCode,
                                    customBaseVersion: customer.customBaseVersion
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
                                    <FileCode className={cn(
                                      "h-4 w-4 shrink-0",
                                      version.isApproved ? "text-blue-500" : "text-muted-foreground"
                                    )} />
                                    <span className={cn(
                                      "flex-shrink-0",
                                      !version.isApproved && "text-muted-foreground italic opacity-60"
                                    )}>
                                      {version.version}
                                    </span>
                                    {latestVersionMap.get(customer.customerCode) === version.versionId && <LatestIndicator />}
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
                                      {canAddVersion && (
                                        <TreeActionMenuItem onClick={() => onHotfix?.(version.versionId, version.version, customer.customerCode)}>
                                          <Flame className="h-4 w-4 mr-2 text-orange-500" />
                                          핫픽스 생성
                                        </TreeActionMenuItem>
                                      )}
                                      {canAddVersion && (
                                        <TreeActionMenuItem onClick={() => onBuild?.(version.versionId, version.version, customer.customerCode)}>
                                          <Hammer className="h-4 w-4 mr-2 text-blue-500" />
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
                                          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                                          'hover:bg-accent',
                                          selectedVersionId === hotfix.versionId && 'bg-accent'
                                        )}
                                        onClick={() => onSelectVersion({
                                          versionId: hotfix.versionId,
                                          version: hotfix.fullVersion,
                                          isHotfix: true,
                                          customerCode: customer.customerCode,
                                          customBaseVersion: customer.customBaseVersion
                                        })}
                                      >
                                        <div className="flex items-center gap-2 flex-1 text-left text-sm">
                                          <Flame className="h-4 w-4 shrink-0 text-orange-500" />
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
                                        {showActions && canDeleteVersion && (
                                          <TreeActionMenu>
                                            <TreeActionMenuItem
                                              destructive
                                              onClick={() => onDelete?.(hotfix.versionId, hotfix.fullVersion, true)}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              삭제
                                            </TreeActionMenuItem>
                                          </TreeActionMenu>
                                        )}
                                      </div>
                                    ))}

                                    {/* 빌드 */}
                                    {hasBuilds && version.builds!.map((build) => (
                                      <div
                                        key={`build-${build.versionId}`}
                                        className={cn(
                                          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                                          'hover:bg-accent',
                                          selectedVersionId === build.versionId && 'bg-accent'
                                        )}
                                        onClick={() => onSelectVersion({
                                          versionId: build.versionId,
                                          version: build.fullVersion,
                                          isHotfix: false,
                                          isBuild: true,
                                          buildBaseVersion: version.version,
                                          customerCode: customer.customerCode,
                                          customBaseVersion: customer.customBaseVersion,
                                        })}
                                      >
                                        <div className="flex items-center gap-2 flex-1 text-left text-sm">
                                          <Hammer className="h-4 w-4 shrink-0 text-blue-500" />
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
