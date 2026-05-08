/**
 * 서버 진행도 공용 API
 *
 * 패치/버전/빌드 생성 등 모든 장시간 작업의 진행도를 조회.
 * 백엔드 엔드포인트: GET /api/progress/{progressId}
 */
import { apiClient } from '@/shared/api/client'

import type { ProgressResponse } from './types'

export const progressApi = {
  /** 진행도 조회 (1초 polling 용) */
  getProgress: async (progressId: string): Promise<ProgressResponse | null> => {
    const response = await apiClient.get<ProgressResponse | null>(
      `/api/progress/${progressId}`
    )
    return response
  },
}
