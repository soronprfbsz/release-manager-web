/**
 * Project Selector Component
 * 프로젝트 선택 드롭다운 컴포넌트
 */

import { ChevronDown, FolderKanban } from 'lucide-react'

import { useProject } from '@/app/providers/ProjectProvider'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

interface ProjectSelectorProps {
  className?: string
}

export function ProjectSelector({ className }: ProjectSelectorProps) {
  const { projectId, projects, isLoading, selectProject } = useProject()

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
          <FolderKanban className="h-4 w-4 mr-2" />
          <span className="truncate max-w-[100px]">
            {currentProject?.projectName || projectId}
          </span>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
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
                isSelected && 'bg-primary/10'
              )}
            >
              <FolderKanban className={cn(
                "h-4 w-4 mr-2 flex-shrink-0",
                isSelected && "text-primary"
              )} />
              <span className={cn(
                isSelected && "text-primary"
              )}>{project.projectName}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
