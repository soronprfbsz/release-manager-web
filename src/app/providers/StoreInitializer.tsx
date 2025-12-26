/**
 * Store Initializer
 * Zustand 스토어 초기화 및 React Query 연동
 */

import { useEffect, type ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/entities/_shared/dashboard'
import { patchKeys } from '@/entities/patches/patch'
import { useProjects } from '@/entities/operations/project'
import { releaseKeys } from '@/entities/releases/release'

import { useAuthStore, useProjectStore, initializeAuth } from '@/shared/store'

interface StoreInitializerProps {
  children: ReactNode
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const initializeWithProjects = useProjectStore((state) => state.initializeWithProjects)

  // Auth 초기화 (한 번만 실행)
  useEffect(() => {
    initializeAuth()
  }, [])

  // 프로젝트 목록 조회 (인증 완료 후에만 요청)
  const { data: projects = [] } = useProjects({
    enabled: isAuthenticated && !isAuthLoading, // 인증 완료 후에만 실행
  })

  // 프로젝트 목록 로드 후 초기화
  useEffect(() => {
    if (projects.length > 0) {
      initializeWithProjects(projects)
    }
  }, [projects, initializeWithProjects])

  // projectId 변경 감지 및 쿼리 무효화
  useEffect(() => {
    let prevProjectId = useProjectStore.getState().projectId

    const unsubscribe = useProjectStore.subscribe((state) => {
      const newProjectId = state.projectId

      // projectId가 실제로 변경되었고, 프로젝트 목록이 로드된 경우에만 무효화
      if (newProjectId !== prevProjectId && state.projects.length > 0) {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        queryClient.invalidateQueries({ queryKey: releaseKeys.all })
        queryClient.invalidateQueries({ queryKey: patchKeys.all })
        prevProjectId = newProjectId
      }
    })

    return unsubscribe
  }, [queryClient])

  return <>{children}</>
}
