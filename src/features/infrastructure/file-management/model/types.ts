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

import type { FileSortBy, FileSortDirection } from '@/shared/lib/utils/file-sort'

export interface FileFiltersState {
  category: string
  keyword: string
  sortBy: FileSortBy
  sortDirection: FileSortDirection
}

// ============================================================================
// 리소스 파일 트리 관리 타입 (온보딩/인스톨과 동일한 구조)
// ============================================================================

/** 리소스 파일 트리 업로드 폼 데이터 */
export interface ResourceTreeUploadFormData {
  file: File | null
  targetPath: string
  extractZip: boolean
}

/** 리소스 파일 트리 삭제 대상 */
export interface ResourceTreeDeleteTarget {
  name: string
  path: string
  type: 'file' | 'directory'
  category: string
  categoryName: string
}

/** 리소스 파일 트리 디렉토리 생성 대상 */
export interface ResourceTreeDirectoryCreateTarget {
  parentPath: string
  category: string
  categoryName: string
}

/** 초기 리소스 트리 업로드 폼 데이터 */
export const INITIAL_RESOURCE_TREE_UPLOAD_FORM_DATA: ResourceTreeUploadFormData = {
  file: null,
  targetPath: '/',
  extractZip: false,
}

