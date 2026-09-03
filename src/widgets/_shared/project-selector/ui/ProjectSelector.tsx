/**
 * Project Selector Component
 * 프로젝트 선택 드롭다운 컴포넌트
 */

import { ChevronDown, FolderKanban } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { useProjectStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { GlyphBadge } from '@/shared/ui/glyph-badge'

interface ProjectSelectorProps {
  className?: string
}

export function ProjectSelector({ className }: ProjectSelectorProps) {
  const projectId = useProjectStore((state) => state.projectId)
  const projects = useProjectStore((state) => state.projects)
  const isLoading = useProjectStore((state) => state.isLoading)
  const selectProject = useProjectStore((state) => state.selectProject)

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={cn('min-w-[140px]', className)}>
        <FolderKanban className="h-4 w-4 mr-2" />
        로딩 중...
      </Button>
    )
  }

  const currentProject = projects.find((p) => p.projectId === projectId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('min-w-[140px]', className)}>
          {currentProject ? (
            <GlyphBadge
              size="sm"
              className="mr-2"
              name={currentProject.projectName}
              glyphText={currentProject.glyphText}
              glyphBackgroundColor={currentProject.glyphBackgroundColor}
            />
          ) : (
            <FolderKanban className="h-4 w-4 mr-2" />
          )}
          <span className="truncate max-w-[100px]">
            {currentProject?.projectName || projectId}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>프로젝트 선택</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => {
          const isSelected = project.projectId === projectId
          return (
            <DropdownMenuItem
              key={project.projectId}
              onClick={() => selectProject(project.projectId)}
              className={cn(
                'cursor-pointer',
                isSelected && 'bg-primary/20 text-primary'
              )}
            >
              <GlyphBadge
                size="sm"
                className="mr-2"
                name={project.projectName}
                glyphText={project.glyphText}
                glyphBackgroundColor={project.glyphBackgroundColor}
              />
              <span className="min-w-0 truncate">{project.projectName}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
