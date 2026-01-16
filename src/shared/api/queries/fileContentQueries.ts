/**
 * File Content Query Hook (통합)
 * 모든 파일 내용 조회를 위한 통합 쿼리 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { fileContentApi, type FileContentResponse } from '../fileContentApi'

// Query Keys Factory
export const fileContentKeys = {
  all: ['file-content'] as const,
  content: (filePath: string) => [...fileContentKeys.all, filePath] as const,
}

/**
 * 통합 파일 내용 조회 훅
 * @param filePath 파일 경로 (예: versions/infraeye2/standard/1.0.x/1.0.0/mariadb/1.patch.sql)
 * @param enabled 쿼리 활성화 여부
 */
export function useFileContentByPath(
  filePath: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<FileContentResponse, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: fileContentKeys.content(filePath),
    queryFn: () => fileContentApi.getContent(filePath),
    enabled: enabled && !!filePath,
    staleTime: Infinity, // 파일 내용은 변경되지 않음
    ...options,
  })
}
