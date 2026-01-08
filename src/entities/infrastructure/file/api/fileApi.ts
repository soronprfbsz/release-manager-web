/**
 * File API
 * 파일 관련 API
 */

import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'

import type { File, FileUpdateRequest, FileContent } from '../model/types'

const ENDPOINTS = {
  list: '/api/resources',
  detail: (id: number) => `/api/resources/${id}`,
  download: (id: number) => `/api/resources/${id}/download`,
  fileContent: (id: number) => `/api/resources/${id}/file-content`,
  reorder: '/api/resources/order',
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

  /** 파일 다운로드 */
  download: (id: number): void => {
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL || ''}${ENDPOINTS.download(id)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /** 파일 순서 변경 */
  reorder: async (fileCategory: string, resourceFileIds: number[]): Promise<void> => {
    await apiClient.patch(ENDPOINTS.reorder, { fileCategory, resourceFileIds })
  },

  /** 파일 내용 조회 */
  getFileContent: async (id: number): Promise<FileContent> => {
    const response = await apiClient.get<FileContent>(ENDPOINTS.fileContent(id))
    return response
  },
}

