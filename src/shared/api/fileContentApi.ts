/**
 * File Content API (통합)
 * 모든 파일 내용 조회를 위한 통합 API
 *
 * 사용 예:
 * - versions/infraeye2/standard/1.0.x/1.0.0/mariadb/1.patch.sql
 * - resources/file/script/MARIADB/backup.sh
 * - onboardings/infraeye1/mariadb/init.sql
 */

import { apiClient } from './client'

const ENDPOINT = '/api/files/content'

/** 통합 파일 내용 응답 타입 */
export interface FileContentResponse {
  content: string
  mimeType: string
  isBinary: boolean
}

export const fileContentApi = {
  /** 파일 내용 조회 (통합 API) */
  getContent: async (filePath: string): Promise<FileContentResponse> => {
    const response = await apiClient.get<FileContentResponse>(ENDPOINT, {
      params: { filePath },
    })
    return response
  },
}
