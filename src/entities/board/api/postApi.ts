/**
 * Post API
 * 게시글 관련 API (백엔드 BoardPostController와 동기화)
 */

import { apiClient } from '@/shared/api/client'

import type {
  Post,
  PostListItem,
  PostCreateRequest,
  PostUpdateRequest,
  PostListParams,
  BoardPageResponse,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/board/posts',
  byId: (id: number) => `/api/board/posts/${id}`,
  view: (id: number) => `/api/board/posts/${id}/view`,
  like: (id: number) => `/api/board/posts/${id}/like`,
  imageUpload: '/api/board/images',
} as const

export const postApi = {
  /**
   * 게시글 목록 조회 (페이징)
   * GET /api/board/posts
   */
  getList: async (params: PostListParams): Promise<BoardPageResponse<PostListItem>> => {
    const queryParams = new URLSearchParams()
    if (params.topicId) queryParams.append('topicId', params.topicId)
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.page !== undefined) queryParams.append('page', String(params.page))
    if (params.size !== undefined) queryParams.append('size', String(params.size))
    if (params.sort) queryParams.append('sort', params.sort)

    const url = `${ENDPOINTS.base}?${queryParams.toString()}`
    return await apiClient.get<BoardPageResponse<PostListItem>>(url)
  },

  /**
   * 게시글 상세 조회
   * GET /api/board/posts/{id}
   */
  getById: async (id: number): Promise<Post> => {
    return await apiClient.get<Post>(ENDPOINTS.byId(id))
  },

  /**
   * 게시글 생성
   * POST /api/board/posts
   */
  create: async (request: PostCreateRequest): Promise<Post> => {
    return await apiClient.post<Post>(ENDPOINTS.base, request)
  },

  /**
   * 게시글 수정
   * PUT /api/board/posts/{id}
   */
  update: async (id: number, request: PostUpdateRequest): Promise<Post> => {
    return await apiClient.put<Post>(ENDPOINTS.byId(id), request)
  },

  /**
   * 게시글 삭제
   * DELETE /api/board/posts/{id}
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /**
   * 게시글 조회수 증가
   * POST /api/board/posts/{id}/view
   */
  incrementView: async (id: number): Promise<void> => {
    await apiClient.post(ENDPOINTS.view(id))
  },

  /**
   * 게시글 좋아요 토글
   * POST /api/board/posts/{id}/like
   * @returns boolean (true: 좋아요 추가, false: 좋아요 취소)
   */
  toggleLike: async (id: number): Promise<boolean> => {
    return await apiClient.post<boolean>(ENDPOINTS.like(id))
  },

  /**
   * 이미지 업로드
   * POST /api/board/images
   */
  uploadImage: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    // apiClient.upload는 response.data.data를 반환함
    const response = await apiClient.upload<{
      fileName: string
      url: string
      size: number
      mimeType: string
    }>(
      ENDPOINTS.imageUpload,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )
    return response.url
  },
}
