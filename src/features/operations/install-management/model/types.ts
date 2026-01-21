/**
 * Install Management Types
 * 인스톨 파일 관리 타입 정의
 */

/** 인스톨 파일 업로드 폼 데이터 */
export interface InstallFileUploadFormData {
  file: File | null
  targetPath: string
  extractZip: boolean
}

/** 인스톨 파일 삭제 대상 */
export interface InstallFileDeleteTarget {
  name: string
  path: string
  type: 'file' | 'directory'
}

/** 초기 폼 데이터 */
export const INITIAL_INSTALL_UPLOAD_FORM_DATA: InstallFileUploadFormData = {
  file: null,
  targetPath: '/',
  extractZip: false,
}
