/**
 * File Download API (통합)
 * 모든 개별 파일 다운로드를 위한 통합 API
 *
 * 사용 예:
 * - versions/infraeye2/standard/1.0.x/1.0.0/mariadb/1.patch.sql
 * - resources/file/script/MARIADB/backup.sh
 * - onboardings/infraeye1/mariadb/init.sql
 * - publishing/1/css/style.css
 */

import { apiClient } from './client'

const ENDPOINT = '/api/files/download'

export const fileDownloadApi = {
  /**
   * 파일 다운로드 (통합 API)
   * @param filePath 파일 경로
   * @param fileName 다운로드될 파일명 (선택적, 지정하지 않으면 원본 파일명 사용)
   */
  download: (filePath: string, fileName?: string): void => {
    const baseUrl = apiClient.getAxiosInstance().defaults.baseURL || ''
    const encodedPath = encodeURIComponent(filePath)
    const url = `${baseUrl}${ENDPOINT}?filePath=${encodedPath}`

    const link = document.createElement('a')
    link.href = url
    if (fileName) {
      link.download = fileName
    }
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
