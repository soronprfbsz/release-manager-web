/**
 * Script Entity Types
 * 스크립트 다운로드 도메인 타입 정의
 */

export interface ScriptType {
  code: string
  description: string
  fileName: string
}

export interface ScriptDownloadParams {
  typeCode: string
}
