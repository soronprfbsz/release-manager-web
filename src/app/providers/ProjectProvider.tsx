/**
 * Project Provider
 * 전역 프로젝트 선택 상태 관리
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/app/providers/AuthProvider'

import { projectApi, type Project, DEFAULT_PROJECT_ID } from '@/entities/project'

const STORAGE_KEY = 'release-manager-selected-project'

interface ProjectContextType {
  /** 현재 선택된 프로젝트 ID */
  projectId: string
  /** 현재 선택된 프로젝트 정보 */
  currentProject: Project | null
  /** 프로젝트 목록 */
  projects: Project[]
  /** 프로젝트 목록 로딩 중 */
  isLoading: boolean
  /** 프로젝트 선택 */
  selectProject: (projectId: string) => void
}

const ProjectContext = createContext<ProjectContextType | null>(null)

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  // localStorage에서 초기값 로드
  const [projectId, setProjectId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || DEFAULT_PROJECT_ID
  })

  // 프로젝트 목록 조회 (인증 완료 후에만 요청)
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getList(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    enabled: isAuthenticated && !isAuthLoading, // 인증 완료 후에만 실행
  })

  // 현재 선택된 프로젝트
  const currentProject = projects.find((p) => p.projectId === projectId) || null

  // 프로젝트 선택 시 localStorage 저장 및 관련 쿼리 무효화
  const selectProject = useCallback(
    (newProjectId: string) => {
      setProjectId(newProjectId)
      localStorage.setItem(STORAGE_KEY, newProjectId)

      // 프로젝트 변경 시 관련 데이터 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-top-customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-monthly-patches'] })
      queryClient.invalidateQueries({ queryKey: ['releases'] })
      queryClient.invalidateQueries({ queryKey: ['patches'] })
    },
    [queryClient]
  )

  // 프로젝트 목록 로드 후, 저장된 프로젝트가 없으면 첫 번째 프로젝트 선택
  useEffect(() => {
    if (projects.length > 0 && !currentProject) {
      const firstProject = projects[0]
      selectProject(firstProject.projectId)
    }
  }, [projects, currentProject, selectProject])

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        currentProject,
        projects,
        isLoading,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
