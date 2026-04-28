import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'
import { API_TIMEOUT } from '@/shared/config/constants'
import { downloadWithProgress, type DownloadProgressEvent } from '@/shared/lib/utils/download-helper'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchCustomer,
  CustomPatchVersion,
  GenerateResponse,
  PatchFileStructure,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/patches',
  histories: '/api/patch-histories',
  historyById: (id: number) => `/api/patch-histories/${id}`,
  // Standard patch
  generateStandard: '/api/patches/standard/generate',
  // Custom patch
  customCustomers: (projectId: string) => `/api/patches/custom/customers?projectId=${projectId}`,
  customVersions: (customerId: number, projectId: string) =>
    `/api/patches/custom/customers/${customerId}/versions?projectId=${projectId}`,
  generateCustom: '/api/patches/custom/generate',
  // Common
  byId: (id: number) => `/api/patches/${id}`,
  download: (id: number) => `/api/patches/${id}/download`,
  files: (id: number) => `/api/patches/${id}/files`,
  delete: (id: number) => `/api/patches/${id}`,
  bulkDelete: (ids: number[]) => `/api/patches?ids=${ids.join(',')}`,
} as const

export const patchApi = {
  /** 패치 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { releaseType?: string; projectId?: string; customerCode?: string }): Promise<PageResponse<CumulativePatch>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.releaseType) queryParams.append('releaseType', params.releaseType)
    if (params?.projectId) queryParams.append('projectId', params.projectId)
    if (params?.customerCode) queryParams.append('customerCode', params.customerCode)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<CumulativePatch>>(url)
    return response
  },

  /** 고객사별 패치 이력 조회 (페이징) */
  getHistories: async (params: PaginationParams & { projectId: string; customerId: number }): Promise<PageResponse<CumulativePatch>> => {
    const queryParams = new URLSearchParams()
    queryParams.append('projectId', params.projectId)
    queryParams.append('customerId', String(params.customerId))
    if (params.page !== undefined) queryParams.append('page', String(params.page))
    if (params.size !== undefined) queryParams.append('size', String(params.size))
    if (params.sort) queryParams.append('sort', params.sort)

    const url = `${ENDPOINTS.histories}?${queryParams.toString()}`
    const response = await apiClient.get<PageResponse<CumulativePatch>>(url)
    return response
  },

  /** 패치 이력 삭제 */
  deleteHistory: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.historyById(id))
  },

  /** 패치 상세 조회 */
  getById: async (id: number): Promise<CumulativePatchDetail> => {
    const response = await apiClient.get<CumulativePatchDetail>(ENDPOINTS.byId(id))
    return response
  },

  /** 표준 패치 생성 */
  generateStandard: async (request: CumulativePatchGenerateRequest): Promise<GenerateResponse> => {
    const response = await apiClient.post<GenerateResponse>(
      ENDPOINTS.generateStandard,
      request,
      { timeout: API_TIMEOUT.FILE_OPERATION },
    )
    return response
  },

  /** 커스텀 버전 보유 고객사 목록 조회 */
  getCustomPatchCustomers: async (projectId: string): Promise<CustomPatchCustomer[]> => {
    const response = await apiClient.get<CustomPatchCustomer[]>(ENDPOINTS.customCustomers(projectId))
    return response
  },

  /** 고객사별 커스텀 버전 목록 조회 */
  getCustomPatchVersions: async (customerId: number, projectId: string): Promise<CustomPatchVersion[]> => {
    const response = await apiClient.get<CustomPatchVersion[]>(ENDPOINTS.customVersions(customerId, projectId))
    return response
  },

  /** 커스텀 패치 생성 */
  generateCustom: async (request: CustomPatchGenerateRequest): Promise<CumulativePatch> => {
    const response = await apiClient.post<CumulativePatch>(
      ENDPOINTS.generateCustom,
      request,
      { timeout: API_TIMEOUT.FILE_OPERATION },
    )
    return response
  },

  /** 패치 파일 다운로드 - 진행률 지원 */
  download: async (
    id: number,
    fileName: string,
    onProgress?: (event: DownloadProgressEvent) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    await downloadWithProgress({
      url: ENDPOINTS.download(id),
      filename: fileName,
      onProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
      signal,
    })
  },

  /** 패치 파일 구조 조회 */
  getFileStructure: async (id: number): Promise<PatchFileStructure> => {
    const response = await apiClient.get<PatchFileStructure>(ENDPOINTS.files(id))
    return response
  },

  /** 패치 삭제 */
  deleteById: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.delete(id))
  },

  /** 패치 일괄 삭제 */
  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete(ENDPOINTS.bulkDelete(ids))
  },
}
