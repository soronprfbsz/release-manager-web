/**
 * SiteNote Queries
 * 사이트 특이사항 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { siteNoteApi } from '../api/siteNoteApi'

import type {
  SiteNoteCreateRequest,
  SiteNoteUpdateRequest,
} from '../model/types'

// Query Keys Factory
export const siteNoteKeys = {
  all: ['siteNotes'] as const,
  lists: () => [...siteNoteKeys.all, 'list'] as const,
  list: (siteId: number) => [...siteNoteKeys.lists(), siteId] as const,
}

// Query Hooks
export const useSiteNotes = (siteId: number) =>
  useQuery({
    queryKey: siteNoteKeys.list(siteId),
    queryFn: () => siteNoteApi.getList(siteId),
    enabled: !!siteId,
  })

// Mutation Hooks
export const useCreateSiteNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      siteId,
      data,
    }: {
      siteId: number
      data: SiteNoteCreateRequest
    }) => siteNoteApi.create(siteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: siteNoteKeys.list(variables.siteId),
      })
    },
  })
}

export const useUpdateSiteNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      siteId,
      noteId,
      data,
    }: {
      siteId: number
      noteId: number
      data: SiteNoteUpdateRequest
    }) => siteNoteApi.update(siteId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: siteNoteKeys.list(variables.siteId),
      })
    },
  })
}

export const useDeleteSiteNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      siteId,
      noteId,
    }: {
      siteId: number
      noteId: number
    }) => siteNoteApi.delete(siteId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: siteNoteKeys.list(variables.siteId),
      })
    },
  })
}
