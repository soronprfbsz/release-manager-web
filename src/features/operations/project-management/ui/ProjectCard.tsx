/**
 * Project Card Component
 * 프로젝트 카드 컴포넌트
 */

import { Pencil, Trash2 } from 'lucide-react'

import type { Project } from '@/entities/operations/project'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  showDelete?: boolean
}

export function ProjectCard({ project, onEdit, onDelete, showDelete = true }: ProjectCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 h-full flex flex-col bg-accent/40 border border-border">
      <CardHeader className="pb-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 제목 및 부제목 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base truncate">
                  {project.projectName}
                </CardTitle>
                {!project.isEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    비활성
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs font-mono text-muted-foreground truncate">
                {project.projectId}
              </CardDescription>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(project)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(project)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 mt-auto">
        {/* 설명 영역 (최소 높이 확보) */}
        <div className="min-h-[2.75rem]">
          {project.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              설명 없음
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
