/**
 * Project Query Keys and Hooks
 * 프로젝트 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { fileContentKeys, useFileContentByPath } from '@/shared/api'

import { projectApi } from '../api/projectApi'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  OnboardingFilesResponse,
  OnboardingFileDeleteResponse,
  OnboardingFileUploadResponse,
  OnboardingDirectoryCreateResponse,
  InstallFilesResponse,
  InstallFileDeleteResponse,
  InstallFileUploadResponse,
  InstallDirectoryCreateResponse,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  // 온보딩
  onboardingFiles: (id: string) => [...projectKeys.all, 'files', id] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  onboardingFileContent: (filePath: string) => fileContentKeys.content(filePath),
  // 인스톨
  installFiles: (id: string) => [...projectKeys.all, 'installs', id] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 프로젝트 목록 조회 훅
 */
export function useProjects(
  options?: Omit<UseQueryOptions<Project[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => projectApi.getList(),
    staleTime: 10 * 60 * 1000, // 10분간 캐시
    ...options,
  })
}

/**
 * 프로젝트 상세 조회 훅
 */
export function useProject(
  id: string,
  options?: Omit<UseQueryOptions<Project, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * 온보딩 파일 조회 훅
 */
export function useOnboardingFiles(
  projectId: string,
  options?: Omit<UseQueryOptions<OnboardingFilesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.onboardingFiles(projectId),
    queryFn: () => projectApi.getOnboardingFiles(projectId),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 온보딩 파일 내용 조회 훅 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: onboardings/infraeye1/mariadb/init.sql)
 * @param enabled 쿼리 활성화 여부
 */
export function useOnboardingFileContent(
  filePath: string,
  enabled: boolean = true
) {
  return useFileContentByPath(filePath, enabled)
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 프로젝트 생성 훅
 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectCreateRequest) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

/**
 * 프로젝트 수정 훅
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateRequest }) =>
      projectApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

/**
 * 프로젝트 삭제 훅
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

/**
 * 온보딩 파일 업로드 훅
 */
export function useUploadOnboardingFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<
    OnboardingFileUploadResponse,
    Error,
    { file: File; targetPath?: string; extractZip?: boolean; onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void; signal?: AbortSignal }
  >({
    mutationFn: ({ file, targetPath, extractZip, onUploadProgress, signal }) =>
      projectApi.uploadOnboardingFile(projectId, file, targetPath, extractZip, onUploadProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.onboardingFiles(projectId) })
    },
  })
}

/**
 * 온보딩 파일 삭제 훅
 */
export function useDeleteOnboardingFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<OnboardingFileDeleteResponse, Error, string>({
    mutationFn: (filePath: string) =>
      projectApi.deleteOnboardingFile(projectId, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.onboardingFiles(projectId) })
    },
  })
}

/**
 * 온보딩 디렉토리 생성 훅
 */
export function useCreateOnboardingDirectory(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<OnboardingDirectoryCreateResponse, Error, string>({
    mutationFn: (path: string) =>
      projectApi.createOnboardingDirectory(projectId, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.onboardingFiles(projectId) })
    },
  })
}

// ============================================================================
// Install (인스톨) Query Hooks
// ============================================================================

/**
 * 인스톨 파일 조회 훅
 */
export function useInstallFiles(
  projectId: string,
  options?: Omit<UseQueryOptions<InstallFilesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.installFiles(projectId),
    queryFn: () => projectApi.getInstallFiles(projectId),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 인스톨 파일 내용 조회 훅 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: installs/infraeye1/mariadb/init.sql)
 * @param enabled 쿼리 활성화 여부
 */
export function useInstallFileContent(
  filePath: string,
  enabled: boolean = true
) {
  return useFileContentByPath(filePath, enabled)
}

// ============================================================================
// Install (인스톨) Mutation Hooks
// ============================================================================

/**
 * 인스톨 파일 업로드 훅
 */
export function useUploadInstallFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<
    InstallFileUploadResponse,
    Error,
    { file: File; targetPath?: string; extractZip?: boolean; onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void; signal?: AbortSignal }
  >({
    mutationFn: ({ file, targetPath, extractZip, onUploadProgress, signal }) =>
      projectApi.uploadInstallFile(projectId, file, targetPath, extractZip, onUploadProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.installFiles(projectId) })
    },
  })
}

/**
 * 인스톨 파일 삭제 훅
 */
export function useDeleteInstallFile(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<InstallFileDeleteResponse, Error, string>({
    mutationFn: (filePath: string) =>
      projectApi.deleteInstallFile(projectId, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.installFiles(projectId) })
    },
  })
}

/**
 * 인스톨 디렉토리 생성 훅
 */
export function useCreateInstallDirectory(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation<InstallDirectoryCreateResponse, Error, string>({
    mutationFn: (path: string) =>
      projectApi.createInstallDirectory(projectId, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.installFiles(projectId) })
    },
  })
}
