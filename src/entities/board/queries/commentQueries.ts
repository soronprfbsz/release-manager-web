/**
 * Comment Queries
 * 댓글 관련 React Query hooks
 */

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { commentApi } from '../api/commentApi'
import type {
  CommentCreateRequest,
  CommentUpdateRequest,
  Comment,
  BoardPageResponse,
} from '../model/types'
import { postKeys } from './postQueries'

// Query Keys Factory
export const commentKeys = {
  all: ['board', 'comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (postId: number) => [...commentKeys.lists(), postId] as const,
}

// Query Hooks
export const useComments = (postId: number, options?: { enabled?: boolean }) =>
  useInfiniteQuery({
    queryKey: commentKeys.list(postId),
    queryFn: ({ pageParam = 0 }) =>
      commentApi.getList({ postId, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: BoardPageResponse<Comment>) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: (options?.enabled ?? true) && !!postId,
    staleTime: 1000 * 30, // 30초간 캐시
  })

// Mutation Hooks
export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CommentCreateRequest) => commentApi.create(data),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      })
      // 게시글 댓글 수 업데이트를 위해 무효화
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      })
    },
  })
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      postId: number
      data: CommentUpdateRequest
    }) => commentApi.update(id, data),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; postId: number }) =>
      commentApi.delete(id),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(variables.postId),
      })
      // 게시글 댓글 수 업데이트를 위해 무효화
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      })
    },
  })
}

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: number; postId: number }) =>
      commentApi.toggleLike(id),

    // Optimistic update
    onMutate: async ({ id, postId }) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) })

      const previousComments = queryClient.getQueryData(
        commentKeys.list(postId)
      )

      // 댓글 목록 내 해당 댓글 optimistic 업데이트
      queryClient.setQueryData(commentKeys.list(postId), (old: unknown) => {
        if (!old) return old
        const data = old as { pages: BoardPageResponse<Comment>[] }
        if (!data.pages) return old

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            content: page.content.map((comment) => {
              if (comment.commentId === id) {
                return {
                  ...comment,
                  isLikedByMe: !comment.isLikedByMe,
                  likeCount: comment.isLikedByMe
                    ? comment.likeCount - 1
                    : comment.likeCount + 1,
                }
              }
              // 대댓글 확인
              if (comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.commentId === id
                      ? {
                          ...reply,
                          isLikedByMe: !reply.isLikedByMe,
                          likeCount: reply.isLikedByMe
                            ? reply.likeCount - 1
                            : reply.likeCount + 1,
                        }
                      : reply
                  ),
                }
              }
              return comment
            }),
          })),
        }
      })

      return { previousComments }
    },

    onError: (_error, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          commentKeys.list(postId),
          context.previousComments
        )
      }
    },

    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) })
    },
  })
}
