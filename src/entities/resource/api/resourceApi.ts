import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'

import type { ResourceFile } from '../model/types'

const ENDPOINTS = {
  list: '/api/resources',
  detail: (id: number) => `/api/resources/${id}`,
  download: (id: number) => `/api/resources/${id}/download`,
  reorder: '/api/resources/order',
} as const

export const resourceApi = {
  /** 리소스 파일 목록 조회 */
  getList: async (): Promise<ResourceFile[]> => {
    const response = await apiClient.get<ResourceFile[]>(ENDPOINTS.list)
    return response
  },

  /** 리소스 파일 상세 조회 */
  getDetail: async (id: number): Promise<ResourceFile> => {
    const response = await apiClient.get<ResourceFile>(ENDPOINTS.detail(id))
    return response
  },

  /** 리소스 파일 업로드 */
  upload: async (
    file: File,
    fileCategory: string,
    resourceFileName: string,
    subCategory?: string,
    description?: string,
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<ResourceFile> => {
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

    const response = await apiClient.post<ResourceFile>(ENDPOINTS.list, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
    })
    return response
  },

  /** 리소스 파일 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.detail(id))
  },

  /** 리소스 파일 다운로드 */
  download: (id: number): void => {
    // 브라우저 네이티브 다운로드 사용
    const link = document.createElement('a')
    link.href = `${apiClient.getAxiosInstance().defaults.baseURL || ''}${ENDPOINTS.download(id)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  /** 리소스 파일 순서 변경 */
  reorderResources: async (fileCategory: string, resourceFileIds: number[]): Promise<void> => {
    await apiClient.patch(ENDPOINTS.reorder, { fileCategory, resourceFileIds })
  },
}
