import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import { FileSyncRequest, FileSyncApplyRequest, FileSyncAnalyzeResponse, IgnoredFile } from './types'

// 쿼리 키
export const fileSyncKeys = {
    all: ['file-sync'] as const,
    ignores: () => [...fileSyncKeys.all, 'ignores'] as const,
}

export const useAnalyzeFileSync = () => {
    return useMutation({
        mutationFn: async (params: FileSyncRequest = {}) => {
            const data = await apiClient.post<FileSyncAnalyzeResponse>('/api/file-sync/analyze', params)
            return data
        },
    })
}

export const useApplyFileSync = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params: FileSyncApplyRequest) => {
            const data = await apiClient.post<void>('/api/file-sync/apply', params)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fileSyncKeys.ignores() })
        },
    })
}

// 무시된 파일 목록 조회
export const useIgnoredFiles = () => {
    return useQuery({
        queryKey: fileSyncKeys.ignores(),
        queryFn: async () => {
            const data = await apiClient.get<IgnoredFile[]>('/api/file-sync/ignores')
            return data
        },
    })
}

// 무시된 파일 복원 (무시 해제)
export const useRestoreIgnoredFile = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (ignoreId: number) => {
            await apiClient.delete<void>(`/api/file-sync/ignores/${ignoreId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fileSyncKeys.ignores() })
        },
    })
}
