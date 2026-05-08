/**
 * 서버 진행도 공용 타입
 *
 * 패치 생성 / 버전 생성 / 빌드 생성 등 모든 장시간 작업에서 공통으로 사용.
 * 백엔드 ServerProgressDto.ProgressResponse 와 1:1 대응.
 */
export interface ProgressResponse {
  /** 현재 완료된 단계 번호 (1-based) */
  step: number
  /** 전체 단계 수 */
  totalSteps: number
  /** 현재 단계 메시지 */
  message: string
  /** 작업 완료 여부 */
  completed: boolean
}
