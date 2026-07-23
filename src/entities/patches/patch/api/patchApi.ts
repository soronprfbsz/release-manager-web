import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'
import { API_TIMEOUT } from '@/shared/config/constants'
import { triggerBrowserDownload } from '@/shared/lib/download/triggerBrowserDownload'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchSite,
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
  customSites: (projectId: string) => `/api/patches/custom/sites?projectId=${projectId}`,
  customVersions: (siteId: number, projectId: string) =>
    `/api/patches/custom/sites/${siteId}/versions?projectId=${projectId}`,
  generateCustom: '/api/patches/custom/generate',
  // Common
  byId: (id: number) => `/api/patches/${id}`,
  complete: (id: number) => `/api/patches/${id}/complete`,
  download: (id: number) => `/api/patches/${id}/download`,
  files: (id: number) => `/api/patches/${id}/files`,
  delete: (id: number) => `/api/patches/${id}`,
  bulkDelete: (ids: number[]) => `/api/patches?ids=${ids.join(',')}`,
  previewName: '/api/patches/preview-name',
} as const

export const patchApi = {
  /** 패치 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { releaseType?: string; projectId?: string; siteCode?: string }): Promise<PageResponse<CumulativePatch>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.releaseType) queryParams.append('releaseType', params.releaseType)
    if (params?.projectId) queryParams.append('projectId', params.projectId)
    if (params?.siteCode) queryParams.append('siteCode', params.siteCode)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<CumulativePatch>>(url)
    return response
  },

  /** 사이트별 패치 이력 조회 (페이징) */
  getHistories: async (params: PaginationParams & { projectId: string; siteId: number }): Promise<PageResponse<CumulativePatch>> => {
    const queryParams = new URLSearchParams()
    queryParams.append('projectId', params.projectId)
    queryParams.append('siteId', String(params.siteId))
    if (params.page !== undefined) queryParams.append('page', String(params.page))
    if (params.size !== undefined) queryParams.append('size', String(params.size))
    if (params.sort) queryParams.append('sort', params.sort)

    const url = `${ENDPOINTS.histories}?${queryParams.toString()}`
    const response = await apiClient.get<PageResponse<CumulativePatch>>(url)
    return response
  },

  /** 패치 이력 삭제 — 버전 재계산이 길어질 수 있어 파일 작업용 타임아웃 사용 */
  deleteHistory: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.historyById(id), { timeout: API_TIMEOUT.FILE_OPERATION })
  },

  /** 패치 상세 조회 */
  getById: async (id: number): Promise<CumulativePatchDetail> => {
    const response = await apiClient.get<CumulativePatchDetail>(ENDPOINTS.byId(id))
    return response
  },

  /** 표준 패치 생성 — 선택적으로 X-Progress-Id 헤더 전송 (frontend polling 으로 진행도 표시) */
  generateStandard: async (
    request: CumulativePatchGenerateRequest,
    progressId?: string,
  ): Promise<GenerateResponse> => {
    const response = await apiClient.post<GenerateResponse>(
      ENDPOINTS.generateStandard,
      request,
      {
        timeout: API_TIMEOUT.FILE_OPERATION,
        ...(progressId ? { headers: { 'X-Progress-Id': progressId } } : {}),
      },
    )
    return response
  },

  /** 커스텀 버전 보유 사이트 목록 조회 */
  getCustomPatchSites: async (projectId: string): Promise<CustomPatchSite[]> => {
    const response = await apiClient.get<CustomPatchSite[]>(ENDPOINTS.customSites(projectId))
    return response
  },

  /** 사이트별 커스텀 버전 목록 조회 */
  getCustomPatchVersions: async (siteId: number, projectId: string): Promise<CustomPatchVersion[]> => {
    const response = await apiClient.get<CustomPatchVersion[]>(ENDPOINTS.customVersions(siteId, projectId))
    return response
  },

  /** 커스텀 패치 생성 — 선택적으로 X-Progress-Id 헤더 전송 */
  generateCustom: async (
    request: CustomPatchGenerateRequest,
    progressId?: string,
  ): Promise<CumulativePatch> => {
    const response = await apiClient.post<CumulativePatch>(
      ENDPOINTS.generateCustom,
      request,
      {
        timeout: API_TIMEOUT.FILE_OPERATION,
        ...(progressId ? { headers: { 'X-Progress-Id': progressId } } : {}),
      },
    )
    return response
  },

  /** 패치 파일 다운로드 - 브라우저 네이티브 다운로드 */
  download: (id: number): void => {
    triggerBrowserDownload(ENDPOINTS.download(id))
  },

  /** 패치 파일 구조 조회 */
  getFileStructure: async (id: number): Promise<PatchFileStructure> => {
    const response = await apiClient.get<PatchFileStructure>(ENDPOINTS.files(id))
    return response
  },

  /** 패치 완료 처리 — 완료 후 해당 patch row 삭제됨 (대용량 파일 삭제 동반 → 파일 작업용 타임아웃) */
  completePatch: async (id: number): Promise<void> => {
    await apiClient.post(ENDPOINTS.complete(id), null, { timeout: API_TIMEOUT.FILE_OPERATION })
  },

  /** 패치 삭제 — 대용량 파일 삭제로 길어질 수 있어 파일 작업용 타임아웃 사용 */
  deleteById: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.delete(id), { timeout: API_TIMEOUT.FILE_OPERATION })
  },

  /** 패치 일괄 삭제 — 여러 패치 파일 삭제로 가장 길어질 수 있어 파일 작업용 타임아웃 사용 */
  bulkDelete: async (ids: number[]): Promise<void> => {
    await apiClient.delete(ENDPOINTS.bulkDelete(ids), { timeout: API_TIMEOUT.FILE_OPERATION })
  },

  /**
   * 자동 생성될 패치명 미리보기 — 백엔드의 충돌 검사까지 적용된 실 확정 이름 반환
   * @param siteCode 빈 값이면 "undefined" prefix
   */
  previewName: async (siteCode?: string): Promise<string> => {
    const query = siteCode ? `?siteCode=${encodeURIComponent(siteCode)}` : ''
    const response = await apiClient.get<{ patchName: string }>(`${ENDPOINTS.previewName}${query}`)
    return response.patchName
  },
}
