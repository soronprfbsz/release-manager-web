/**
 * Post Queries
 * 게시글 관련 React Query hooks
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { commentKeys } from './commentQueries'
import { postApi } from '../api/postApi'

import type {
  PostCreateRequest,
  PostUpdateRequest,
  PostListParams,
  PostListItem,
  BoardPageResponse,
} from '../model/types'

// Query Keys Factory
export const postKeys = {
  all: ['board', 'posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: Omit<PostListParams, 'page'>) =>
    [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
}

// Query Hooks
export const usePosts = (
  params: Omit<PostListParams, 'page'>,
  options?: { enabled?: boolean }
) =>
  useInfiniteQuery({
    queryKey: postKeys.list(params),
    queryFn: ({ pageParam = 0 }) =>
      postApi.getList({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: BoardPageResponse<PostListItem>) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30, // 30초간 캐시
  })

export const usePost = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.getById(id),
    enabled: (options?.enabled ?? true) && !!id,
  })

// Mutation Hooks
export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PostCreateRequest) => postApi.create(data),
    onSuccess: (_, variables) => {
      // 해당 토픽의 게시글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: postKeys.lists(),
        predicate: (query) => {
          const queryKey = query.queryKey as unknown[]
          const params = queryKey[queryKey.length - 1] as
            | Omit<PostListParams, 'page'>
            | undefined
          return params?.topicId === variables.topicId
        },
      })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PostUpdateRequest }) =>
      postApi.update(id, data),
    onSuccess: (updatedPost) => {
      // 상세 캐시 업데이트
      queryClient.setQueryData(postKeys.detail(updatedPost.postId), updatedPost)
      // 목록 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postApi.delete(id),
    onSuccess: (_, id) => {
      // 상세 캐시 제거
      queryClient.removeQueries({ queryKey: postKeys.detail(id) })
      // 댓글 캐시 제거
      queryClient.removeQueries({ queryKey: commentKeys.list(id) })
      // 목록 무효화
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

export const useTogglePostLike = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postApi.toggleLike(id),

    // Optimistic update
    onMutate: async (id) => {
      // 상세 쿼리 취소
      await queryClient.cancelQueries({ queryKey: postKeys.detail(id) })

      // 이전 값 스냅샷
      const previousPost = queryClient.getQueryData(postKeys.detail(id))

      // Optimistic 업데이트
      queryClient.setQueryData(postKeys.detail(id), (old: unknown) => {
        if (!old) return old
        const post = old as { isLikedByMe: boolean; likeCount: number }
        return {
          ...post,
          isLikedByMe: !post.isLikedByMe,
          likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1,
        }
      })

      return { previousPost }
    },

    onError: (_error, id, context) => {
      // 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(id), context.previousPost)
      }
    },

    onSettled: (_, __, id) => {
      // 서버 상태 동기화
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) })
    },
  })
}

export const useIncrementPostView = () => {
  return useMutation({
    mutationFn: (id: number) => postApi.incrementView(id),
  })
}

export const useUploadPostImage = () => {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: number) => void
    }) => postApi.uploadImage(file, onProgress),
  })
}
