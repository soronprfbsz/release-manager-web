/**
 * File Management Feature Types
 * 파일 관리 기능 타입 정의
 */

export interface FileUploadFormData {
  file: File | null
  fileCategory: string
  subCategory: string
  resourceFileName: string
  description: string
}

export type FileUploadMode = 'upload' | null

export interface FileFiltersState {
  category: string
  keyword: string
}

