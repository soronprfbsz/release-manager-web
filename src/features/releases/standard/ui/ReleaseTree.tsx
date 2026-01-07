import { useState, useEffect } from 'react'

import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Flame, Star } from 'lucide-react'

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
export interface SelectedVersionInfo {
  versionId: number
  version: string
  isHotfix: boolean
}

interface ReleaseTreeProps {
  majorMinorGroups: MajorMinorNode[]
  selectedVersionId: number | null
  onSelectVersion: (info: SelectedVersionInfo) => void
}

/** 최신 버전 표시용 아이콘 */
function LatestIndicator() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        최신 버전
      </TooltipContent>
    </Tooltip>
  )
}

export function ReleaseTree({ majorMinorGroups, selectedVersionId, onSelectVersion }: ReleaseTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // 모든 그룹 기본 펼침
    return new Set(majorMinorGroups.map(g => g.majorMinor))
  })
  
  // 핫픽스가 있는 버전들의 확장 상태
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set())

  // 최신 버전 ID 계산
  const latestVersionId = findLatestVersionId(majorMinorGroups)

  // 데이터가 비동기로 로드될 때 모든 그룹 펼침
  useEffect(() => {
    if (majorMinorGroups.length > 0) {
      setExpandedGroups(new Set(majorMinorGroups.map(g => g.majorMinor)))
    }
  }, [majorMinorGroups])

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

  if (majorMinorGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-26rem)] text-muted-foreground">
        <p className="text-sm">릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {majorMinorGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.majorMinor)

        return (
          <div key={group.majorMinor}>
            <button
              onClick={() => toggleGroup(group.majorMinor)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              <span className="font-medium">{group.majorMinor}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({group.versions.length})
              </span>
            </button>

            {isExpanded && (
              <div className="ml-4 pl-2 border-l border-border">
                {group.versions.map((version) => {
                  const hasHotfixes = version.hotfixes && version.hotfixes.length > 0
                  const isVersionExpanded = expandedVersions.has(version.versionId)

                  return (
                    <div key={version.versionId}>
                      <div className="flex items-center">
                        {/* 핫픽스가 있는 경우 확장 버튼 */}
                        {hasHotfixes ? (
                          <button
                            onClick={(e) => toggleVersion(version.versionId, e)}
                            className="p-0.5 hover:bg-accent rounded shrink-0"
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
                        <button
                          onClick={() => onSelectVersion({
                            versionId: version.versionId,
                            version: version.version,
                            isHotfix: false
                          })}
                          className={cn(
                            'flex items-center gap-2 flex-1 px-2 py-1.5 rounded-md text-left text-sm',
                            'hover:bg-accent hover:text-accent-foreground',
                            selectedVersionId === version.versionId && 'bg-accent text-accent-foreground'
                          )}
                        >
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
                          {version.versionId === latestVersionId && <LatestIndicator />}
                          <div className="flex gap-1 ml-auto items-center">
                            {version.releaseCategory === 'INSTALL' && (
                              <Badge
                                variant="install"
                                className="text-[10px] px-1 py-0 h-4 leading-none"
                              >
                                INSTALL
                              </Badge>
                            )}
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
                        </button>
                      </div>

                      {/* 핫픽스 목록 */}
                      {hasHotfixes && isVersionExpanded && (
                        <div className="ml-6 pl-2 border-l border-border/50">
                          {version.hotfixes.map((hotfix) => (
                            <button
                              key={hotfix.versionId}
                              onClick={() => onSelectVersion({
                                versionId: hotfix.versionId,
                                version: hotfix.fullVersion,
                                isHotfix: true
                              })}
                              className={cn(
                                'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm',
                                'hover:bg-accent hover:text-accent-foreground',
                                selectedVersionId === hotfix.versionId && 'bg-accent text-accent-foreground'
                              )}
                            >
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
                            </button>
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
