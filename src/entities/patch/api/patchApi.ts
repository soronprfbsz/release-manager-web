import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'
import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  PatchFileStructure,
  PatchFileContent,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/patches',
  generate: '/api/patches/generate',
  byId: (id: number) => `/api/patches/${id}`,
  download: (id: number) => `/api/patches/${id}/download`,
  files: (id: number) => `/api/patches/${id}/files`,
  fileContent: (id: number, path: string) => `/api/patches/${id}/content?path=${encodeURIComponent(path)}`,
  delete: (id: number) => `/api/patches/${id}`,
} as const

export const patchApi = {
  /** 패치 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { releaseType?: string }): Promise<PageResponse<CumulativePatch>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.releaseType) queryParams.append('releaseType', params.releaseType)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<CumulativePatch>>(url)
    return response
  },

  /** 패치 상세 조회 */
  getById: async (id: number): Promise<CumulativePatchDetail> => {
    const response = await apiClient.get<CumulativePatchDetail>(ENDPOINTS.byId(id))
    return response
  },

  /** 패치 생성 */
  generate: async (request: CumulativePatchGenerateRequest): Promise<CumulativePatch> => {
    const response = await apiClient.post<CumulativePatch>(ENDPOINTS.generate, request)
    return response
  },

  /** 패치 파일 다운로드 */
  download: async (id: number, fileName: string): Promise<void> => {
    const response = await apiClient.getAxiosInstance().get(ENDPOINTS.download(id), {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  },

  /** 패치 파일 구조 조회 */
  getFileStructure: async (id: number): Promise<PatchFileStructure> => {
    const response = await apiClient.get<PatchFileStructure>(ENDPOINTS.files(id))
    return response
  },

  /** 패치 파일 내용 조회 */
  getFileContent: async (id: number, path: string): Promise<PatchFileContent> => {
    const response = await apiClient.get<PatchFileContent>(ENDPOINTS.fileContent(id, path))
    return response
  },

  /** 패치 삭제 */
  deleteById: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.delete(id))
  },
}
