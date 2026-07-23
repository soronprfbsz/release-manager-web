import { useEffect, useState } from 'react'

import { ChevronRight, ChevronDown, Tag, Zap, Wrench, Sparkles, Trash2 } from 'lucide-react'

import type { MajorMinorNode } from '@/entities/releases/release'

import { cn } from '@/shared/lib/utils'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { findLatestVersionId } from '@/shared/lib/utils/version'
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

/** 핫픽스 배지 */
function HotfixBadge() {
  return (
    <Badge variant="destructive" size="sm">
      HOTFIX
    </Badge>
  )
}

/** 선택된 노드 정보 */
export interface SelectedVersionInfo {
  versionId: number
  version: string
  isHotfix: boolean
  /** 빌드 여부 (빌드 노드 선택 시 true) */
  isBuild?: boolean
  /** 빌드 노드의 base 버전 (예: 1.1.0) */
  buildBaseVersion?: string
}

interface ReleaseTreeProps {
  majorMinorGroups: MajorMinorNode[]
  selectedVersionId: number | null
  onSelectVersion: (info: SelectedVersionInfo) => void
  /** 핫픽스 생성 콜백 (일반 버전에서만 표시) */
  onHotfix?: (versionId: number, version: string) => void
  /** 빌드 생성 콜백 (일반 버전에서만 표시) */
  onBuild?: (versionId: number, version: string) => void
  /** 삭제 콜백 */
  onDelete?: (versionId: number, version: string, isHotfix: boolean) => void
  /** 핫픽스/빌드 생성 권한 */
  canAddVersion?: boolean
  /** 삭제 권한 */
  canDeleteVersion?: boolean
}

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

export function ReleaseTree({
  majorMinorGroups,
  selectedVersionId,
  onSelectVersion,
  onHotfix,
  onBuild,
  onDelete,
  canAddVersion = false,
  canDeleteVersion = false,
}: ReleaseTreeProps) {
  const showActions = canAddVersion || canDeleteVersion

  // 핫픽스/빌드가 있는 버전들의 확장 상태
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set())

  // major.minor 그룹 확장 상태 — 최초 마운트 시 최신 버전이 속한 그룹만 펼침
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const latestId = findLatestVersionId(majorMinorGroups)
    if (latestId == null) return new Set()
    for (const group of majorMinorGroups) {
      if (group.versions.some((v) => v.versionId === latestId)) {
        return new Set([group.majorMinor])
      }
    }
    return new Set()
  })

  // 최신 버전 ID 계산
  const latestVersionId = findLatestVersionId(majorMinorGroups)

  // selectedVersionId 가 빌드/핫픽스 노드인 경우 부모(표준 버전) 자동 expand
  useEffect(() => {
    if (selectedVersionId == null) return
    for (const group of majorMinorGroups) {
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
  }, [selectedVersionId, majorMinorGroups])

  // selectedVersionId 가 접힌 그룹 안의 버전(또는 그 하위 build/hotfix)이면 해당 그룹 자동 expand
  useEffect(() => {
    if (selectedVersionId == null) return
    for (const group of majorMinorGroups) {
      const hasMatch = group.versions.some((version) =>
        version.versionId === selectedVersionId ||
        version.hotfixes?.some((h) => h.versionId === selectedVersionId) ||
        version.builds?.some((b) => b.versionId === selectedVersionId)
      )
      if (hasMatch) {
        setExpandedGroups((prev) => {
          if (prev.has(group.majorMinor)) return prev
          const next = new Set(prev)
          next.add(group.majorMinor)
          return next
        })
        return
      }
    }
  }, [selectedVersionId, majorMinorGroups])

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

  const toggleGroup = (majorMinor: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(majorMinor)) {
        next.delete(majorMinor)
      } else {
        next.add(majorMinor)
      }
      return next
    })
  }

  if (majorMinorGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-muted-foreground">
        <p className="text-sm">릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {majorMinorGroups.map((group) => {
        const isGroupExpanded = expandedGroups.has(group.majorMinor)

        return (
          <div key={group.majorMinor}>
            {/* 그룹 헤더 — 평문 uppercase 라벨 (Backstage 시안의 1.5.X / 1.4.X 패턴) */}
            <button
              onClick={() => toggleGroup(group.majorMinor)}
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
                            ? 'bg-primary/10 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                            : 'hover:bg-accent'
                        )}
                        onClick={() => onSelectVersion({
                          versionId: version.versionId,
                          version: version.version,
                          isHotfix: false
                        })}
                      >
                        {/* 핫픽스/빌드가 있는 경우 확장 버튼 */}
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
                          {version.versionId === latestVersionId && <LatestIndicator />}
                          <div className="flex gap-1 ml-auto items-center">
                            {version.fileCategories && version.fileCategories.length > 0 && (
                              <>
                                {version.fileCategories.map((category) => (
                                  <Badge
                                    key={category}
                                    variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                                    size="sm"
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
                              <TreeActionMenuItem onClick={() => onHotfix?.(version.versionId, version.version)}>
                                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                                핫픽스 생성
                              </TreeActionMenuItem>
                            )}
                            {canAddVersion && (
                              <TreeActionMenuItem onClick={() => onBuild?.(version.versionId, version.version)}>
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
                                  ? 'bg-primary/10 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                                  : 'hover:bg-accent'
                              )}
                              onClick={() => onSelectVersion({
                                versionId: hotfix.versionId,
                                version: hotfix.fullVersion,
                                isHotfix: true
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
                                          size="sm"
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
                                'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                                selectedVersionId === build.versionId
                                  ? 'bg-primary/10 text-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]'
                                  : 'hover:bg-accent'
                              )}
                              onClick={() => onSelectVersion({
                                versionId: build.versionId,
                                version: build.fullVersion,
                                isHotfix: false,
                                isBuild: true,
                                buildBaseVersion: version.version,
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
                                          size="sm"
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
  )
}
