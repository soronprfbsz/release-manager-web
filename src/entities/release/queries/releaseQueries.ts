import { useQuery } from '@tanstack/react-query'

import { releaseApi } from '../api/releaseApi'

// Query Keys Factory
export const releaseKeys = {
  all: ['releases'] as const,
  trees: () => [...releaseKeys.all, 'tree'] as const,
  standardTree: (projectId: string) => [...releaseKeys.trees(), 'standard', projectId] as const,
  customTree: (projectId: string, customerCode: string) => [...releaseKeys.trees(), 'custom', projectId, customerCode] as const,
  versions: () => [...releaseKeys.all, 'version'] as const,
  version: (id: number) => [...releaseKeys.versions(), id] as const,
}

// Query Hooks
export const useStandardReleaseTree = (projectId: string) =>
  useQuery({
    queryKey: releaseKeys.standardTree(projectId),
    queryFn: () => releaseApi.getStandardTree(projectId),
  })

export const useCustomReleaseTree = (projectId: string, customerCode: string) =>
  useQuery({
    queryKey: releaseKeys.customTree(projectId, customerCode),
    queryFn: () => releaseApi.getCustomTree(projectId, customerCode),
    enabled: !!customerCode,
  })

export const useReleaseVersion = (id: number) =>
  useQuery({
    queryKey: releaseKeys.version(id),
    queryFn: () => releaseApi.getVersionById(id),
    enabled: !!id,
  })
