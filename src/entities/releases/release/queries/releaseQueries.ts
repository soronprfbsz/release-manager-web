import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { fileContentKeys, useFileContentByPath } from '@/shared/api'

import { releaseApi } from '../api/releaseApi'

import type {
  BuildListResponse,
  BuildsInRangeResponse,
  CreateBuildResponse,
  CustomReleaseTreeResponse,
  ReleaseFileStructure,
  ReleaseTreeResponse,
  ReleaseVersionDetail,
  StandardVersionSimple,
} from '../model/types'

// Query Keys Factory
export const releaseKeys = {
  all: ['releases'] as const,
  trees: () => [...releaseKeys.all, 'tree'] as const,
  standardTree: (projectId: string) => [...releaseKeys.trees(), 'standard', projectId] as const,
  standardVersionList: (projectId: string) => [...releaseKeys.all, 'standard-version-list', projectId] as const,
  customTree: (projectId: string, customerCode: string) => [...releaseKeys.trees(), 'custom', projectId, customerCode] as const,
  allCustomTree: (projectId: string) => [...releaseKeys.trees(), 'custom', 'all', projectId] as const,
  versions: () => [...releaseKeys.all, 'version'] as const,
  version: (id: number) => [...releaseKeys.versions(), id] as const,
  fileStructure: (id: number) => [...releaseKeys.versions(), id, 'files'] as const,
  builds: (baseVersionId: number) => [...releaseKeys.versions(), baseVersionId, 'builds'] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  fileContent: (filePath: string) => fileContentKeys.content(filePath),
}

// Query Hooks
export const useStandardReleaseTree = (
  projectId: string,
  options?: Omit<UseQueryOptions<ReleaseTreeResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.standardTree(projectId),
    queryFn: () => releaseApi.getStandardTree(projectId),
    ...options,
  })

export const useStandardVersionList = (
  projectId: string,
  options?: Omit<UseQueryOptions<StandardVersionSimple[]>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.standardVersionList(projectId),
    queryFn: () => releaseApi.getStandardVersionList(projectId),
    enabled: !!projectId,
    ...options,
  })

export const useCustomReleaseTree = (
  projectId: string,
  customerCode: string,
  options?: Omit<UseQueryOptions<ReleaseTreeResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.customTree(projectId, customerCode),
    queryFn: () => releaseApi.getCustomTree(projectId, customerCode),
    enabled: !!customerCode,
    ...options,
  })

export const useAllCustomReleaseTree = (
  projectId: string,
  options?: Omit<UseQueryOptions<CustomReleaseTreeResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.allCustomTree(projectId),
    queryFn: () => releaseApi.getAllCustomTree(projectId),
    enabled: !!projectId,
    ...options,
  })

export const useReleaseVersion = (
  id: number,
  options?: Omit<UseQueryOptions<ReleaseVersionDetail>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.version(id),
    queryFn: () => releaseApi.getVersionById(id),
    enabled: !!id,
    ...options,
  })

export const useVersionFileStructure = (
  versionId: number,
  options?: Omit<UseQueryOptions<ReleaseFileStructure>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.fileStructure(versionId),
    queryFn: () => releaseApi.getVersionFileStructure(versionId),
    enabled: !!versionId,
    ...options,
  })

/**
 * 파일 내용 조회 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: versions/infraeye2/standard/1.0.x/1.0.0/mariadb/1.patch.sql)
 * @param enabled 쿼리 활성화 여부
 */
export const useReleaseFileContent = (
  filePath: string,
  enabled: boolean = true
) => useFileContentByPath(filePath, enabled)

// Mutation Hooks
interface CreateVersionParams {
  projectId: string
  version: string
  comment: string
  patchFiles: File
  isApproved?: boolean
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  /** 서버 진행도 polling 용 ID (선택) */
  progressId?: string
}

export const useCreateVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateVersionParams) =>
      releaseApi.createVersion(
        params.projectId,
        params.version,
        params.comment,
        params.patchFiles,
        params.isApproved,
        params.onUploadProgress,
        params.progressId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
    },
  })
}

export const useDeleteVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: number) => releaseApi.deleteVersion(versionId),
    onSuccess: (_, versionId) => {
      // 삭제된 버전은 캐시에서 완전히 제거한다 (partial 매칭으로 detail/files/builds 한꺼번에).
      // invalidate 만 하면 detail 패널이 unmount 되기 전에 자동 refetch 가 발화되어
      // 이미 사라진 ID 로 GET /api/releases/versions/{id}/files 등을 호출하게 되고
      // 백엔드에서 RELEASE_VERSION_NOT_FOUND 가 떨어진다.
      queryClient.removeQueries({ queryKey: releaseKeys.version(versionId) })
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
    },
  })
}

export const useApproveVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: number) => releaseApi.approveVersion(versionId),
    onSuccess: (_, versionId) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
      queryClient.invalidateQueries({ queryKey: releaseKeys.version(versionId) })
    },
  })
}

interface UpdateCommentParams {
  versionId: number
  comment: string
}

export const useUpdateVersionComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateCommentParams) =>
      releaseApi.updateComment(params.versionId, params.comment),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
      queryClient.invalidateQueries({ queryKey: releaseKeys.version(params.versionId) })
    },
  })
}

// =====================================
// Build (빌드 버전) 관련 hooks
// =====================================

export const useBuilds = (
  baseVersionId: number,
  options?: Omit<UseQueryOptions<BuildListResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.builds(baseVersionId),
    queryFn: () => releaseApi.getBuilds(baseVersionId),
    enabled: !!baseVersionId,
    ...options,
  })

interface CreateBuildParams {
  baseVersionId: number
  comment: string
  file?: File
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  /** 서버 진행도 polling 용 ID (선택) */
  progressId?: string
}

export const useCreateBuild = () => {
  const queryClient = useQueryClient()

  return useMutation<CreateBuildResponse, Error, CreateBuildParams>({
    mutationFn: (params) =>
      releaseApi.createBuild(
        params.baseVersionId,
        params.comment,
        params.file,
        params.onUploadProgress,
        params.progressId
      ),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.builds(params.baseVersionId) })
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
    },
  })
}

export const useDeleteBuild = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { buildVersionId: number; baseVersionId: number }>({
    mutationFn: ({ buildVersionId }) => releaseApi.deleteBuild(buildVersionId),
    onSuccess: (_, { buildVersionId, baseVersionId }) => {
      // useDeleteVersion 과 동일 — 사라진 빌드 ID 의 캐시(detail/files)를 명시적으로 제거하여
      // 자동 refetch 로 인한 RELEASE_VERSION_NOT_FOUND 호출을 차단한다.
      queryClient.removeQueries({ queryKey: releaseKeys.version(buildVersionId) })
      queryClient.invalidateQueries({ queryKey: releaseKeys.builds(baseVersionId) })
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
    },
  })
}

export const useBuildsInRange = (
  projectId: string | null,
  fromVersionId: number | null,
  toVersionId: number | null,
  customerId?: number | null,
) =>
  useQuery<BuildsInRangeResponse>({
    queryKey: ['builds-in-range', projectId, fromVersionId, toVersionId, customerId ?? null],
    queryFn: () =>
      releaseApi.getBuildsInRange(projectId!, fromVersionId!, toVersionId!, customerId),
    enabled: !!projectId && !!fromVersionId && !!toVersionId,
  })

