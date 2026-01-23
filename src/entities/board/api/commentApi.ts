/**
 * Comment API
 * 댓글 관련 API (백엔드 BoardCommentController와 동기화)
 */

import { apiClient } from '@/shared/api/client'

import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentListParams,
  BoardPageResponse,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/board/comments',
  byId: (id: number) => `/api/board/comments/${id}`,
  byPost: (postId: number) => `/api/board/posts/${postId}/comments`,
  like: (id: number) => `/api/board/comments/${id}/like`,
} as const

export const commentApi = {
  /**
   * 댓글 목록 조회 (게시글별)
   * GET /api/board/posts/{postId}/comments
   */
  getList: async (params: CommentListParams): Promise<BoardPageResponse<Comment>> => {
    const queryParams = new URLSearchParams()
    if (params.page !== undefined) queryParams.append('page', String(params.page))
    if (params.size !== undefined) queryParams.append('size', String(params.size))

    const queryString = queryParams.toString()
    const url = queryString
      ? `${ENDPOINTS.byPost(params.postId)}?${queryString}`
      : ENDPOINTS.byPost(params.postId)

    return await apiClient.get<BoardPageResponse<Comment>>(url)
  },

  /**
   * 댓글 생성
   * POST /api/board/comments
   */
  create: async (request: CommentCreateRequest): Promise<Comment> => {
    return await apiClient.post<Comment>(ENDPOINTS.base, request)
  },

  /**
   * 댓글 수정
   * PUT /api/board/comments/{id}
   */
  update: async (id: number, request: CommentUpdateRequest): Promise<Comment> => {
    return await apiClient.put<Comment>(ENDPOINTS.byId(id), request)
  },

  /**
   * 댓글 삭제 (소프트 삭제)
   * DELETE /api/board/comments/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /**
   * 댓글 좋아요 토글
   * POST /api/board/comments/{id}/like
   * @returns boolean (true: 좋아요 추가, false: 좋아요 취소)
   */
  toggleLike: async (id: number): Promise<boolean> => {
    return await apiClient.post<boolean>(ENDPOINTS.like(id))
  },
}
