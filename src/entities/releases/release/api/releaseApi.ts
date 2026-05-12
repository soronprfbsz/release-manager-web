import { apiClient } from '@/shared/api/client'
import { API_TIMEOUT } from '@/shared/config/constants'
import { triggerBrowserDownload } from '@/shared/lib/download/triggerBrowserDownload'

import type {
  BuildListResponse,
  BuildsInRangeResponse,
  CreateBuildResponse,
  CustomReleaseTreeResponse,
  ReleaseFileStructure,
  ReleaseTreeResponse,
  ReleaseVersionDetail,
  StandardVersionSimple,
} from '../model/types'

const ENDPOINTS = {
  standardTree: (id: string) => `/api/releases/projects/${id}/standard/tree`,
  standardVersionList: (id: string) => `/api/releases/projects/${id}/versions`,
  customTree: (id: string, customerCode: string) => `/api/releases/projects/${id}/custom/${customerCode}/tree`,
  allCustomTree: (id: string) => `/api/releases/projects/${id}/custom/tree`,
  versionById: (id: number) => `/api/releases/versions/${id}`,
  versionFiles: (id: number) => `/api/releases/versions/${id}/files`,
  versionDownload: (id: number) => `/api/releases/versions/${id}/download`,
  createVersion: '/api/releases/versions/standard',
  createCustomVersion: '/api/releases/versions/custom',
  deleteVersion: (id: number) => `/api/releases/versions/${id}`,
  approveVersion: (id: number) => `/api/releases/versions/${id}/approve`,
  // 핫픽스 관련 엔드포인트
  createHotfix: (id: number) => `/api/releases/versions/${id}/hotfix`,
  getHotfixes: (id: number) => `/api/releases/versions/${id}/hotfixes`,
  // 빌드 관련 엔드포인트
  createBuild: (id: number) => `/api/releases/versions/${id}/builds`,
  getBuilds: (id: number) => `/api/releases/versions/${id}/builds`,
  deleteBuild: (id: number) => `/api/releases/builds/${id}`,
  // 코멘트 수정 엔드포인트
  updateComment: (id: number) => `/api/releases/versions/${id}/comment`,
  // 빌드 범위 조회
  buildsInRange: '/api/releases/versions/builds-in-range',
} as const

export const releaseApi = {
  /** 표준 릴리즈 트리 조회 */
  getStandardTree: async (projectId: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.standardTree(projectId))
    return response
  },

  /** 표준본 버전 목록 조회 (셀렉트박스용) */
  getStandardVersionList: async (projectId: string): Promise<StandardVersionSimple[]> => {
    const response = await apiClient.get<StandardVersionSimple[]>(ENDPOINTS.standardVersionList(projectId))
    return response
  },

  /** 커스텀 릴리즈 트리 조회 (특정 고객사) */
  getCustomTree: async (projectId: string, customerCode: string): Promise<ReleaseTreeResponse> => {
    const response = await apiClient.get<ReleaseTreeResponse>(ENDPOINTS.customTree(projectId, customerCode))
    return response
  },

  /** 전체 커스텀 릴리즈 트리 조회 (모든 고객사) */
  getAllCustomTree: async (projectId: string): Promise<CustomReleaseTreeResponse> => {
    const response = await apiClient.get<CustomReleaseTreeResponse>(ENDPOINTS.allCustomTree(projectId))
    return response
  },

  /** 버전 상세 조회 */
  getVersionById: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.get<ReleaseVersionDetail>(ENDPOINTS.versionById(id))
    return response
  },

  /** 표준 버전 생성 (multipart/form-data) */
  createVersion: async (
    projectId: string,
    version: string,
    comment: string,
    patchFiles: File,
    isApproved?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    progressId?: string
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('version', version)
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)
    if (isApproved !== undefined) {
      formData.append('isApproved', String(isApproved))
    }

    await apiClient.upload(ENDPOINTS.createVersion, formData, {
      onUploadProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
      ...(progressId ? { headers: { 'X-Progress-Id': progressId } } : {}),
    })
  },

  /** 커스텀 버전 생성 (multipart/form-data) */
  createCustomVersion: async (
    projectId: string,
    customerId: number,
    customVersion: string,
    comment: string,
    patchFiles: File,
    isApproved?: boolean,
    customBaseVersionId?: number,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    progressId?: string
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('customerId', String(customerId))
    formData.append('customVersion', customVersion)
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)
    if (isApproved !== undefined) {
      formData.append('isApproved', String(isApproved))
    }
    if (customBaseVersionId !== undefined) {
      formData.append('customBaseVersionId', String(customBaseVersionId))
    }

    await apiClient.upload(ENDPOINTS.createCustomVersion, formData, {
      onUploadProgress,
      timeout: API_TIMEOUT.FILE_OPERATION,
      ...(progressId ? { headers: { 'X-Progress-Id': progressId } } : {}),
    })
  },

  /** 버전 삭제 */
  deleteVersion: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.deleteVersion(id))
  },

  /** 버전 파일 트리 구조 조회 */
  getVersionFileStructure: async (id: number): Promise<ReleaseFileStructure> => {
    const response = await apiClient.get<ReleaseFileStructure>(ENDPOINTS.versionFiles(id))
    return response
  },

  /** 버전 전체 다운로드 (ZIP) - 브라우저 네이티브 다운로드 */
  downloadVersion: (id: number): void => {
    triggerBrowserDownload(ENDPOINTS.versionDownload(id))
  },

  /** 버전 승인 */
  approveVersion: async (id: number): Promise<ReleaseVersionDetail> => {
    const response = await apiClient.patch<ReleaseVersionDetail>(ENDPOINTS.approveVersion(id))
    return response
  },

  /** 핫픽스 생성 (multipart/form-data) */
  createHotfix: async (
    projectId: string,
    hotfixBaseVersionId: number,
    comment: string,
    patchFiles: File,
    engineerId?: number,
    isApproved?: boolean,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<ReleaseVersionDetail> => {
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('hotfixBaseVersionId', String(hotfixBaseVersionId))
    formData.append('comment', comment)
    formData.append('patchFiles', patchFiles)
    if (engineerId !== undefined) {
      formData.append('engineerId', String(engineerId))
    }
    if (isApproved !== undefined) {
      formData.append('isApproved', String(isApproved))
    }

    const response = await apiClient.upload<ReleaseVersionDetail>(
      ENDPOINTS.createHotfix(hotfixBaseVersionId),
      formData,
      {
        onUploadProgress,
        timeout: API_TIMEOUT.FILE_OPERATION
      }
    )
    return response
  },

  /** 특정 버전의 핫픽스 목록 조회 */
  getHotfixes: async (versionId: number): Promise<ReleaseVersionDetail[]> => {
    const response = await apiClient.get<ReleaseVersionDetail[]>(ENDPOINTS.getHotfixes(versionId))
    return response
  },

  /** 버전 코멘트 수정 */
  updateComment: async (versionId: number, comment: string): Promise<void> => {
    await apiClient.patch(ENDPOINTS.updateComment(versionId), { comment })
  },

  /**
   * 빌드 버전 생성 (multipart/form-data)
   *
   * buildVersion 은 항상 서버가 오늘 날짜(yyMMdd)-회차 형태로 자동 부여한다.
   *
   * @param baseVersionId  빌드 원본 버전 ID
   * @param comment        빌드 노트 (필수)
   * @param file           ZIP 파일 (선택, 루트는 web/engine 만 허용)
   */
  createBuild: async (
    baseVersionId: number,
    comment: string,
    file?: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    progressId?: string
  ): Promise<CreateBuildResponse> => {
    const formData = new FormData()
    formData.append('comment', comment)
    if (file) {
      formData.append('file', file)
    }

    const response = await apiClient.upload<CreateBuildResponse>(
      ENDPOINTS.createBuild(baseVersionId),
      formData,
      {
        onUploadProgress,
        timeout: API_TIMEOUT.FILE_OPERATION,
        ...(progressId ? { headers: { 'X-Progress-Id': progressId } } : {}),
      }
    )
    return response
  },

  /** 특정 버전의 빌드 목록 조회 (build_version DESC) */
  getBuilds: async (baseVersionId: number): Promise<BuildListResponse> => {
    const response = await apiClient.get<BuildListResponse>(ENDPOINTS.getBuilds(baseVersionId))
    return response
  },

  /** 빌드 버전 삭제 (행 + 디렉토리) */
  deleteBuild: async (buildVersionId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.deleteBuild(buildVersionId))
  },

  /** 버전 범위 내 빌드 후보 조회 */
  getBuildsInRange: async (
    projectId: string,
    fromVersionId: number,
    toVersionId: number,
    customerId?: number | null,
  ): Promise<BuildsInRangeResponse> => {
    const queryParams = new URLSearchParams({
      projectId,
      fromVersionId: String(fromVersionId),
      toVersionId: String(toVersionId),
    })
    if (customerId != null) queryParams.append('customerId', String(customerId))
    const response = await apiClient.get<BuildsInRangeResponse>(
      `${ENDPOINTS.buildsInRange}?${queryParams.toString()}`
    )
    return response
  },

}
