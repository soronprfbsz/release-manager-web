/**
 * Project Store (Zustand)
 * 전역 프로젝트 선택 상태 관리
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

import type { Project } from '@/entities/operations/project'
import { DEFAULT_PROJECT_ID } from '@/entities/operations/project'

interface ProjectState {
  // State
  projectId: string
  currentProject: Project | null
  projects: Project[]
  isLoading: boolean

  // Actions
  setProjectId: (projectId: string) => void
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setIsLoading: (isLoading: boolean) => void
  selectProject: (projectId: string, invalidateQueries?: () => void) => void
  initializeWithProjects: (projects: Project[]) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        projectId: DEFAULT_PROJECT_ID,
        currentProject: null,
        projects: [],
        isLoading: false,

        // Actions
        setProjectId: (projectId) =>
          set({ projectId }, false, 'setProjectId'),

        setCurrentProject: (currentProject) =>
          set({ currentProject }, false, 'setCurrentProject'),

        setProjects: (projects) => {
          set({ projects }, false, 'setProjects')
        },

        setIsLoading: (isLoading) =>
          set({ isLoading }, false, 'setIsLoading'),

        selectProject: (newProjectId, invalidateQueries) => {
          const { projects } = get()
          const newProject = projects.find((p) => p.projectId === newProjectId) || null

          set(
            {
              projectId: newProjectId,
              currentProject: newProject,
            },
            false,
            'selectProject'
          )

          // 프로젝트 변경 시 관련 쿼리 무효화 (옵션)
          invalidateQueries?.()
        },

        initializeWithProjects: (projects) => {
          const { projectId } = get()
          const currentProject = projects.find((p) => p.projectId === projectId)

          if (!currentProject && projects.length > 0) {
            // 저장된 프로젝트가 없으면 첫 번째 프로젝트 선택
            const firstProject = projects[0]
            set(
              {
                projects,
                projectId: firstProject.projectId,
                currentProject: firstProject,
              },
              false,
              'initializeWithProjects/firstProject'
            )
          } else {
            set(
              {
                projects,
                currentProject: currentProject || null,
              },
              false,
              'initializeWithProjects'
            )
          }
        },
      }),
      {
        name: 'project-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ projectId: state.projectId }),
      }
    ),
    { name: 'ProjectStore' }
  )
)
