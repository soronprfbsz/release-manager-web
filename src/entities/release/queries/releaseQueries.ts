import { useQuery } from '@tanstack/react-query'

import { releaseApi } from '../api/releaseApi'

// Query Keys Factory
export const releaseKeys = {
  all: ['releases'] as const,
  trees: () => [...releaseKeys.all, 'tree'] as const,
  standardTree: () => [...releaseKeys.trees(), 'standard'] as const,
  customTree: (customerCode: string) => [...releaseKeys.trees(), 'custom', customerCode] as const,
  versions: () => [...releaseKeys.all, 'version'] as const,
  version: (id: number) => [...releaseKeys.versions(), id] as const,
}

// Query Hooks
export const useStandardReleaseTree = () =>
  useQuery({
    queryKey: releaseKeys.standardTree(),
    queryFn: () => releaseApi.getStandardTree(),
  })

export const useCustomReleaseTree = (customerCode: string) =>
  useQuery({
    queryKey: releaseKeys.customTree(customerCode),
    queryFn: () => releaseApi.getCustomTree(customerCode),
    enabled: !!customerCode,
  })

export const useReleaseVersion = (id: number) =>
  useQuery({
    queryKey: releaseKeys.version(id),
    queryFn: () => releaseApi.getVersionById(id),
    enabled: !!id,
  })
