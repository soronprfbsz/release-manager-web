/**
 * File API
 * 파일 관련 API
 */

import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'
import { triggerBrowserDownload } from '@/shared/lib/download/triggerBrowserDownload'

import type {
  File,
  FileUpdateRequest,
  ResourceCategoriesResponse,
  ResourceCategoryFilesResponse,
  ResourceFileDeleteResponse,
  ResourceFileUploadResponse,
  ResourceDirectoryCreateResponse,
  ResourceCategoryCreateRequest,
  ResourceCategoryCreateResponse,
  ResourceCategoryDeleteResponse,
} from '../model/types'

const ENDPOINTS = {
  list: '/api/resources',
  detail: (id: number) => `/api/resources/${id}`,
  reorder: '/api/resources/order',
  // 새 트리 기반 API 엔드포인트
  categories: '/api/resources/categories',
  categoryDetail: (category: string) => `/api/resources/categories/${category}`,
  categoryFiles: (category: string) => `/api/resources/${category}/files`,
  categoryDirectory: (category: string) => `/api/resources/${category}/files/directory`,
  categoryZipDownload: (category: string) => `/api/resources/${category}/files/zip-download`,
} as const

export const fileApi = {
  /** 파일 목록 조회 */
  getList: async (params?: { keyword?: string }): Promise<File[]> => {
    const queryParams = new URLSearchParams()
    if (params?.keyword) queryParams.append('keyword', params.keyword)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.list}?${queryString}` : ENDPOINTS.list

    const response = await apiClient.get<File[]>(url)
    return response
  },

  /** 파일 상세 조회 */
  getDetail: async (id: number): Promise<File> => {
    const response = await apiClient.get<File>(ENDPOINTS.detail(id))
    return response
  },

  /** 파일 업로드 */
  upload: async (
    file: globalThis.File,
    fileCategory: string,
    resourceFileName: string,
    subCategory?: string,
    description?: string,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<File> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileCategory', fileCategory)
    formData.append('resourceFileName', resourceFileName)
    if (subCategory) {
      formData.append('subCategory', subCategory)
    }
    if (description) {
      formData.append('description', description)
    }

    const response = await apiClient.post<File>(ENDPOINTS.list, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
    })
    return response
  },

  /** 파일 수정 */
  update: async (id: number, data: FileUpdateRequest): Promise<File> => {
    const response = await apiClient.put<File>(ENDPOINTS.detail(id), data)
    return response
  },

  /** 파일 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.detail(id))
  },

  /** 파일 순서 변경 */
  reorder: async (fileCategory: string, resourceFileIds: number[]): Promise<void> => {
    await apiClient.patch(ENDPOINTS.reorder, { fileCategory, resourceFileIds })
  },

  // ============================================================================
  // 트리 기반 API (새 API - 프로젝트 온보딩/인스톨과 동일한 구조)
  // ============================================================================

  /** 카테고리 목록 조회 */
  getCategories: async (): Promise<ResourceCategoriesResponse> => {
    const response = await apiClient.get<ResourceCategoriesResponse>(ENDPOINTS.categories)
    return response
  },

  /** 카테고리 생성 */
  createCategory: async (data: ResourceCategoryCreateRequest): Promise<ResourceCategoryCreateResponse> => {
    const response = await apiClient.post<ResourceCategoryCreateResponse>(ENDPOINTS.categories, data)
    return response
  },

  /** 카테고리 삭제 */
  deleteCategory: async (category: string): Promise<ResourceCategoryDeleteResponse> => {
    const response = await apiClient.delete<ResourceCategoryDeleteResponse>(ENDPOINTS.categoryDetail(category))
    return response
  },

  /** 특정 카테고리 파일 트리 조회 */
  getCategoryFiles: async (category: string): Promise<ResourceCategoryFilesResponse> => {
    const response = await apiClient.get<ResourceCategoryFilesResponse>(ENDPOINTS.categoryFiles(category))
    return response
  },

  /** 카테고리 내 파일 업로드 */
  uploadToCategory: async (
    category: string,
    file: globalThis.File,
    targetPath: string,
    extractZip?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal
  ): Promise<ResourceFileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetPath', targetPath)
    if (extractZip !== undefined) {
      formData.append('extractZip', String(extractZip))
    }

    const response = await apiClient.post<ResourceFileUploadResponse>(
      ENDPOINTS.categoryFiles(category),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: API_TIMEOUT.FILE_OPERATION,
        onUploadProgress,
        signal,
      }
    )
    return response
  },

  /** 카테고리 내 파일/디렉토리 삭제 */
  deleteFromCategory: async (category: string, path: string): Promise<ResourceFileDeleteResponse> => {
    const response = await apiClient.delete<ResourceFileDeleteResponse>(
      ENDPOINTS.categoryFiles(category),
      { params: { filePath: path } }
    )
    return response
  },

  /** 카테고리 내 디렉토리 생성 */
  createDirectoryInCategory: async (category: string, path: string): Promise<ResourceDirectoryCreateResponse> => {
    const response = await apiClient.post<ResourceDirectoryCreateResponse>(
      ENDPOINTS.categoryDirectory(category),
      null,
      { params: { path } }
    )
    return response
  },

  /** 카테고리 전체 파일 ZIP 다운로드 - 브라우저 네이티브 다운로드 */
  downloadCategoryZip: (category: string): void => {
    triggerBrowserDownload(ENDPOINTS.categoryZipDownload(category))
  },
}

