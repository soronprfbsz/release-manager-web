/**
 * Project List Component
 * 프로젝트 목록 컴포넌트
 */

import { FolderKanban } from 'lucide-react'

import type { Project } from '@/entities/operations/project'

import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  showEdit?: boolean
  showDelete?: boolean
}

export function ProjectList({ projects, onEdit, onDelete, showEdit = true, showDelete = true }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FolderKanban className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 프로젝트가 없습니다.</p>
        <p className="text-sm mt-1">새 프로젝트를 추가해주세요.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.projectId}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          showEdit={showEdit}
          showDelete={showDelete}
        />
      ))}
    </div>
  )
}
