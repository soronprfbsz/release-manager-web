/**
 * Onboarding Management Types
 * 온보딩 파일 관리 타입 정의
 */

/** 온보딩 파일 업로드 폼 데이터 */
export interface OnboardingFileUploadFormData {
  file: File | null
  targetPath: string
  extractZip: boolean
}

/** 온보딩 파일 삭제 대상 */
export interface OnboardingFileDeleteTarget {
  name: string
  path: string
  type: 'file' | 'directory'
}

/** 초기 폼 데이터 */
export const INITIAL_UPLOAD_FORM_DATA: OnboardingFileUploadFormData = {
  file: null,
  targetPath: '/',
  extractZip: false,
}
