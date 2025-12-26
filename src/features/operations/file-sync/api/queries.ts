import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api'
import {
    FileSyncRequest,
    FileSyncApplyRequest,
    FileSyncAnalyzeResponse,
    IgnoredFile,
    ResourceRegisterRequest,
    BackupRegisterRequest,
    PatchRegisterRequest,
    ReleaseRegisterRequest,
    RegisterResponse,
} from './types'

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

// ============================================================================
// 파일 등록 API (Target별 분리)
// ============================================================================

// 리소스 파일 등록
export const useRegisterResourceFiles = () => {
    return useMutation({
        mutationFn: async (request: ResourceRegisterRequest) => {
            const data = await apiClient.post<RegisterResponse>('/api/file-sync/resources/register', request)
            return data
        },
    })
}

// 백업 파일 등록
export const useRegisterBackupFiles = () => {
    return useMutation({
        mutationFn: async (request: BackupRegisterRequest) => {
            const data = await apiClient.post<RegisterResponse>('/api/file-sync/backups/register', request)
            return data
        },
    })
}

// 패치 파일 등록
export const useRegisterPatchFiles = () => {
    return useMutation({
        mutationFn: async (request: PatchRegisterRequest) => {
            const data = await apiClient.post<RegisterResponse>('/api/file-sync/patches/register', request)
            return data
        },
    })
}

// 릴리즈 파일 등록
export const useRegisterReleaseFiles = () => {
    return useMutation({
        mutationFn: async (request: ReleaseRegisterRequest) => {
            const data = await apiClient.post<RegisterResponse>('/api/file-sync/releases/register', request)
            return data
        },
    })
}
