/**
 * Publishing API
 * 퍼블리싱 리소스 API
 */

import { apiClient } from '@/shared/api/client'
import { triggerBrowserDownload } from '@/shared/lib/download/triggerBrowserDownload'

import type {
  PublishingListItem,
  PublishingDetail,
  PublishingUploadRequest,
  PublishingUpdateRequest,
  PublishingQueryParams,
  PublishingReorderRequest,
  PublishingFileTree,
} from '../model/types'

const ENDPOINTS = {
  list: '/api/publishing',
  detail: (id: number) => `/api/publishing/${id}`,
  upload: '/api/publishing',
  update: (id: number) => `/api/publishing/${id}`,
  delete: (id: number) => `/api/publishing/${id}`,
  reorder: '/api/publishing/reorder',
  download: (id: number) => `/api/publishing/${id}/download`,
  serve: (id: number) => `/api/publishing/${id}/serve/`,
  fileTree: (id: number) => `/api/publishing/${id}/files`,
}

export const publishingApi = {
  /** 퍼블리싱 목록 조회 */
  getList: async (params?: PublishingQueryParams): Promise<PublishingListItem[]> => {
    const response = await apiClient.get<PublishingListItem[]>(ENDPOINTS.list, { params })
    return response
  },

  /** 퍼블리싱 상세 조회 */
  getDetail: async (id: number): Promise<PublishingDetail> => {
    const response = await apiClient.get<PublishingDetail>(ENDPOINTS.detail(id))
    return response
  },

  /** 퍼블리싱 업로드 */
  upload: async (
    data: PublishingUploadRequest,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<PublishingDetail> => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('publishingName', data.publishingName)
    formData.append('publishingCategory', data.publishingCategory)
    if (data.subCategory) {
      formData.append('subCategory', data.subCategory)
    }
    if (data.description) {
      formData.append('description', data.description)
    }
    if (data.customerId) {
      formData.append('customerId', String(data.customerId))
    }
    if (data.glyphText !== undefined) {
      formData.append('glyphText', data.glyphText)
    }
    if (data.glyphBackgroundColor !== undefined) {
      formData.append('glyphBackgroundColor', data.glyphBackgroundColor)
    }

    const response = await apiClient.upload<PublishingDetail>(ENDPOINTS.upload, formData, {
      onUploadProgress: onProgress,
    })
    return response
  },

  /** 퍼블리싱 수정 */
  update: async (id: number, data: PublishingUpdateRequest): Promise<PublishingDetail> => {
    const response = await apiClient.put<PublishingDetail>(ENDPOINTS.update(id), data)
    return response
  },

  /** 퍼블리싱 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.delete(id))
  },

  /** 퍼블리싱 순서 변경 */
  reorder: async (data: PublishingReorderRequest): Promise<void> => {
    await apiClient.patch(ENDPOINTS.reorder, data)
  },

  /** 퍼블리싱 전체 다운로드 (ZIP) - 브라우저 네이티브 다운로드 */
  download: (id: number): void => {
    triggerBrowserDownload(ENDPOINTS.download(id))
  },

  /** 퍼블리싱 미리보기 (새 탭에서 열기) */
  openPreview: (id: number): void => {
    const url = `${import.meta.env.VITE_API_BASE_URL || ''}${ENDPOINTS.serve(id)}`
    window.open(url, '_blank')
  },

  /** 퍼블리싱 서브 URL 가져오기 */
  getServeUrl: (id: number): string => {
    return `${import.meta.env.VITE_API_BASE_URL || ''}${ENDPOINTS.serve(id)}`
  },

  /** 퍼블리싱 파일 트리 조회 */
  getFileTree: async (id: number): Promise<PublishingFileTree> => {
    const response = await apiClient.get<PublishingFileTree>(ENDPOINTS.fileTree(id))
    return response
  },
}
