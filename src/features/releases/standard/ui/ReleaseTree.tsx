import { useState, useEffect } from 'react'

import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Tag } from 'lucide-react'

import type { MajorMinorNode, VersionNode } from '@/entities/release'

import { cn } from '@/shared/lib/utils'
import { getCategoryShortName } from '@/shared/lib/utils/category'
import { Badge } from '@/shared/ui/badge'

interface ReleaseTreeProps {
  majorMinorGroups: MajorMinorNode[]
  selectedVersionId: number | null
  onSelectVersion: (version: VersionNode) => void
}

export function ReleaseTree({ majorMinorGroups, selectedVersionId, onSelectVersion }: ReleaseTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // 모든 그룹 기본 펼침
    return new Set(majorMinorGroups.map(g => g.majorMinor))
  })

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

  if (majorMinorGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Tag className="h-12 w-12 mb-2 opacity-50" />
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
                {group.versions.map((version) => (
                  <button
                    key={version.versionId}
                    onClick={() => onSelectVersion(version)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      selectedVersionId === version.versionId && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <FileCode className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="flex-shrink-0">{version.version}</span>
                    {!version.isApproved && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 leading-none border-yellow-500 text-yellow-600 dark:text-yellow-500">
                        미승인
                      </Badge>
                    )}
                    {version.fileCategories && version.fileCategories.length > 0 && (
                      <div className="flex gap-1 ml-auto">
                        {version.fileCategories.map((category) => (
                          <Badge
                            key={category}
                            variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
                            className="text-[10px] px-1 py-0 h-4 leading-none"
                          >
                            {getCategoryShortName(category)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
