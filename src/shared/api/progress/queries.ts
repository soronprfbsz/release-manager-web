/**
 * 서버 진행도 공용 React Query 훅
 *
 * 패치/버전/빌드 생성 등 모든 장시간 작업에서 재사용.
 * progressId 가 null 이거나 enabled=false 면 polling 비활성.
 * completed=true 응답이 오면 refetchInterval 을 false 로 전환하여 polling 중단.
 */
import { useQuery } from '@tanstack/react-query'

import { progressApi } from './progressApi'

import type { ProgressResponse } from './types'

/**
 * @param progressId  X-Progress-Id 헤더로 전송한 ID. null 이면 비활성.
 * @param enabled     외부에서 명시적으로 제어할 때 사용 (예: mutation.isPending)
 */
export const useServerProgress = (
  progressId: string | null,
  enabled: boolean
) =>
  useQuery<ProgressResponse | null>({
    queryKey: ['server-progress', progressId],
    queryFn: () => progressApi.getProgress(progressId!),
    enabled: enabled && !!progressId,
    // completed=true 이면 polling 중단
    refetchInterval: (query) => {
      const data = query.state.data
      if (data && data.completed) return false
      return 1000
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
  })
