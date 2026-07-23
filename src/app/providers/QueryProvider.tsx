import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Global Query Client Configuration
 *
 * staleTime 전략:
 * - 기본값 (명시 안 함 = 0): CUD 데이터 및 실시간 데이터는 항상 최신 상태 유지
 *   e.g. Site, Engineer, Resource, Patch, Release, Account, Dashboard, Job Status 등
 * - 5분: 마스터 데이터 (Project, Department, Menu)
 * - 10분: 거의 변경되지 않는 데이터 (Code)
 * - Infinity: 읽기 전용 데이터 (파일 내용, 로그)
 *
 * 각 entity의 *Queries.ts 파일에서 데이터 특성에 맞게 개별 설정
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0, // 기본값: CUD 데이터는 항상 최신으로 유지
    },
  },
})

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
