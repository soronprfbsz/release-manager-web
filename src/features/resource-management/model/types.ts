/**
 * Resource Management Feature Types
 * 리소스 관리 기능 타입 정의
 */

export interface ResourceUploadFormData {
  file: File | null
  fileCategory: string
  subCategory: string
  description: string
}

export type ResourceUploadMode = 'upload' | null
