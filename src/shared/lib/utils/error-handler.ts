/**
 * Error Handler Utility
 * 에러 처리 유틸리티 - 공통 에러 핸들링 패턴 제공
 */

import type { ApiError } from '@/shared/api'

import type { AxiosError } from 'axios'


/**
 * Error 객체에서 사용자 친화적인 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // API client가 이미 백엔드 에러를 Error 객체로 변환함
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  // AxiosError 타입 체크 (fallback)
  const axiosError = error as AxiosError<ApiError>
  if (axiosError.response?.data?.data?.message) {
    return axiosError.response.data.data.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * Toast 핸들러를 위한 에러 콜백 생성
 *
 * @example
 * ```ts
 * mutation.mutate(data, {
 *   onSuccess: () => toast({ title: '성공' }),
 *   onError: createErrorHandler(toast, '작업 실패')
 * })
 * ```
 */
export function createErrorHandler(
  toast: (options: {
    title: string
    description: string
    variant?: 'default' | 'destructive'
  }) => void,
  title: string = '오류 발생'
) {
  return (error: unknown) => {
    toast({
      title,
      description: getErrorMessage(error),
      variant: 'destructive',
    })
  }
}

/**
 * 여러 쿼리의 로딩 상태를 통합
 *
 * @example
 * ```ts
 * const isLoading = combineLoadingStates(
 *   sitesQuery.isLoading,
 *   projectsQuery.isLoading
 * )
 * ```
 */
export function combineLoadingStates(...loadingStates: boolean[]): boolean {
  return loadingStates.some((state) => state === true)
}

/**
 * 여러 쿼리의 에러 상태를 통합 (첫 번째 에러 반환)
 */
export function combineErrors(...errors: (Error | null | undefined)[]): Error | null {
  return errors.find((error) => error != null) || null
}
