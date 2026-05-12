/**
 * Project Card Component
 * 프로젝트 카드 컴포넌트 (리뉴얼 — ServiceCard 패턴 적용)
 */

import { Pencil, Trash2 } from 'lucide-react'

import type { Project } from '@/entities/operations/project'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  showEdit?: boolean
  showDelete?: boolean
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
}: ProjectCardProps) {
  const { text: glyphText, glyphClass } = resolveGlyph({
    name: project.projectName,
    glyphText: project.glyphText,
    glyphBackgroundColor: project.glyphBackgroundColor,
  })
  const fontSizeClass = getGlyphFontSizeClass(glyphText)

  return (
    <div className="group relative h-full">
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200',
          'h-full flex flex-col',
          'bg-card border hover:border-foreground/20'
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          {/* 상단 행: 글리프 + 프로젝트명 + 호버 액션 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* 글리프 배지 */}
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center',
                  'font-mono font-semibold select-none',
                  fontSizeClass,
                  glyphClass
                )}
              >
                {glyphText}
              </div>

              {/* 프로젝트명 + 코드 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-base leading-tight truncate">
                    {project.projectName}
                  </h3>
                  {!project.isEnabled && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      비활성
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                  {project.projectId}
                </p>
              </div>
            </div>

            {/* 우상단 액션 버튼 — 호버 시만 표시 */}
            <div
              className={cn(
                'flex items-center gap-0.5 flex-shrink-0',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
              )}
            >
              {showEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(project)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {showDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(project)}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 헤더 ↔ 본문 점선 구분선 */}
        <div className="mx-4 border-t border-dashed border-border" />

        <CardContent className="pt-3 px-4 pb-4 flex-1 min-h-[2.75rem]">
          {project.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              설명 없음
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
