/**
 * ServerProgressView
 *
 * 서버 처리 진행 중 표시되는 공용 컴포넌트.
 * 폼 입력 영역을 대체하여 단계별 체크리스트 + 진행 bar 를 표시.
 *
 * uploadProgress 가 전달되면 업로드(Phase A) + 서버처리(Phase B) 를 한 뷰에 통합.
 *   - Phase A: 클라이언트 → 서버 ZIP 전송 중 (axios onUploadProgress 기반)
 *   - Phase B: 서버 처리 단계 (ServerProgress polling 기반)
 * uploadProgress 가 없으면 기존 서버처리 단계만 표시 (패치 흐름과 동일).
 *
 * 사용처: 패치 생성, 버전 생성, 빌드 생성 등 모든 장시간 서버 작업.
 */

import { Check, Loader2, Server, Upload } from 'lucide-react'

import type { ProgressResponse } from '@/shared/api/progress/types'
import { formatFileSize } from '@/shared/lib/utils/format'

/** 업로드 phase 진행 정보 */
export interface UploadProgressInfo {
  /** 전송된 바이트 */
  loaded: number
  /** 전체 바이트 */
  total: number
  /** 0~100 정수 */
  percent: number
}

interface ServerProgressViewProps {
  /** 서버 처리 진행 상황. null/undefined 면 "시작 중" 상태로 표시 */
  progress?: ProgressResponse | null
  /** 헤더 타이틀 (기본: "처리 중") */
  title?: string
  /** 완료 타이틀 (기본: "처리 완료") */
  completedTitle?: string
  /** 하단 안전 안내 문구 (기본 문구 사용) */
  safetyMessage?: string
  /**
   * 단계 라벨 배열 — 서버 처리 단계 체크리스트 미리보기용.
   * 미전달 시 progress.totalSteps 수만큼 "단계 N" 형식으로 자동 생성.
   * readonly 배열도 허용 (as const 배열 전달 가능).
   */
  steps?: readonly string[]
  /**
   * 업로드 phase 진행 정보.
   * 전달 시 체크리스트 첫 항목에 업로드 step 이 자동 prepend 되어
   * 업로드(Phase A) → 서버처리(Phase B) 를 한 뷰에 통합.
   * 미전달 시 기존 서버처리 단계만 표시 (패치 흐름에 영향 없음).
   */
  uploadProgress?: UploadProgressInfo | null
  /** 업로드 step 체크리스트 라벨 (기본: "파일 업로드") */
  uploadStepLabel?: string
}

export function ServerProgressView({
  progress,
  title = '처리 중',
  completedTitle = '처리 완료',
  safetyMessage,
  steps,
  uploadProgress,
  uploadStepLabel = '파일 업로드',
}: ServerProgressViewProps) {
  const serverStep = progress?.step ?? 0
  const rawTotalSteps = progress?.totalSteps ?? 0
  const serverMessage = progress?.message ?? ''
  const completed = progress?.completed === true

  // 업로드 통합 모드 여부
  const hasUpload = uploadProgress != null

  // 서버 처리 단계 라벨 결정 (readonly 배열도 허용하기 위해 전개)
  const serverSteps: string[] =
    steps && steps.length > 0
      ? [...steps]
      : Array.from(
          { length: rawTotalSteps > 0 ? rawTotalSteps : 1 },
          (_, i) => `단계 ${i + 1}`
        )

  // 통합 체크리스트 = [업로드 항목(있으면)] + 서버 단계들
  const allSteps: string[] = hasUpload
    ? [uploadStepLabel, ...serverSteps]
    : serverSteps

  // 업로드 phase 판정: uploadProgress 가 있고 percent < 100 (또는 서버 step 이 아직 0)
  const isUploadPhase = hasUpload && (uploadProgress.percent < 100) && serverStep === 0

  // ── 단계 카운터 계산 ──────────────────────────────────────────
  // 업로드 통합 시: 총 단계 = 서버 단계 + 1(업로드)
  // Phase A: 현재 단계 = 1 (업로드 진행 중)
  // Phase B: 현재 단계 = serverStep + 1 (업로드 완료이므로 +1 offset)
  const totalSteps = allSteps.length > 0 ? allSteps.length : 1
  let currentStep: number
  if (completed) {
    currentStep = totalSteps
  } else if (hasUpload) {
    currentStep = isUploadPhase ? 1 : serverStep + 1
  } else {
    currentStep = serverStep
  }

  // ── progress bar 퍼센트 ────────────────────────────────────────
  let barPercent: number
  if (completed) {
    barPercent = 100
  } else if (isUploadPhase) {
    // 전체 중 업로드 비중: 1 / totalSteps 구간을 uploadProgress.percent 로 채움
    const uploadWeight = 1 / totalSteps
    barPercent = Math.round(uploadWeight * uploadProgress.percent)
  } else {
    barPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100))
  }

  // ── 메인 메시지 ───────────────────────────────────────────────
  let mainMessage: string
  if (completed) {
    mainMessage = '완료'
  } else if (isUploadPhase) {
    mainMessage = '업로드 중'
  } else {
    mainMessage = serverMessage || '서버 처리 중...'
  }

  // ── 아이콘 선택 ───────────────────────────────────────────────
  // 업로드 phase: Upload 아이콘 / 서버 phase: Server 아이콘
  const PhaseIcon = isUploadPhase ? Upload : Server

  const defaultSafetyMessage = completed
    ? '잠시 후 화면이 자동으로 닫힙니다.'
    : '진행 중인 작업이 끝날 때까지 창을 닫지 말고 기다려주세요.'

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* 헤더 — phase 아이콘 + spinner + 타이틀 */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {completed ? (
            <Check className="h-8 w-8 text-primary" strokeWidth={2.5} />
          ) : (
            <>
              <PhaseIcon className="h-7 w-7 text-primary" />
              <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-primary/30" strokeWidth={1.5} />
            </>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground">
            {completed ? completedTitle : title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {safetyMessage ?? defaultSafetyMessage}
          </p>
        </div>
      </div>

      {/* 단계 카운터 + progress bar + 메시지 */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {currentStep}
            <span className="text-base font-normal text-muted-foreground">
              {' / '}{totalSteps}
            </span>
          </span>
          <span className="font-mono text-sm font-medium text-primary">{barPercent}%</span>
        </div>

        {/* progress bar — phase 에 따라 색상 분리 */}
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={[
              'h-full rounded-full transition-all duration-500 ease-out',
              isUploadPhase
                ? 'bg-blue-500'   // 업로드 phase: 파랑
                : 'bg-primary',   // 서버 phase: primary
            ].join(' ')}
            style={{ width: `${barPercent}%` }}
          />
        </div>

        {/* 메인 메시지 */}
        <p className="text-sm font-medium text-foreground">{mainMessage}</p>

        {/* 업로드 phase 전용: 큰 글씨 % + 바이트 부제 */}
        {isUploadPhase && uploadProgress.total > 0 && (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-blue-500 tabular-nums">
              {uploadProgress.percent}%
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
            </span>
          </div>
        )}
      </div>

      {/* 통합 단계 체크리스트 */}
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">처리 단계</p>
        <ul className="space-y-1.5">
          {allSteps.map((label, idx) => {
            const isUploadItem = hasUpload && idx === 0

            // ── 아이템별 state 결정 ────────────────────────────
            let state: 'done' | 'active' | 'pending'
            if (completed) {
              state = 'done'
            } else if (isUploadItem) {
              // 업로드 항목: 업로드 phase 면 active, 이후면 done
              state = isUploadPhase ? 'active' : 'done'
            } else {
              // 서버 단계 항목: idx=0(업로드 없음) 또는 idx>=1(업로드 있음)
              // serverStepNo = idx (업로드 없음) 또는 idx (=서버 단계 번호)
              const serverIdx = hasUpload ? idx : idx + 1
              if (serverIdx < serverStep) state = 'done'
              else if (serverIdx === serverStep && serverStep > 0) state = 'active'
              else state = 'pending'
            }

            return (
              <li key={`${label}-${idx}`} className="flex items-center gap-2 text-xs">
                <span
                  className={
                    state === 'done'
                      ? 'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'
                      : state === 'active'
                      ? [
                          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2',
                          isUploadItem ? 'border-blue-500' : 'border-primary',
                        ].join(' ')
                      : 'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-muted-foreground/30'
                  }
                >
                  {state === 'done' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  {state === 'active' && (
                    <span
                      className={[
                        'h-1.5 w-1.5 animate-pulse rounded-full',
                        isUploadItem ? 'bg-blue-500' : 'bg-primary',
                      ].join(' ')}
                    />
                  )}
                </span>
                <span
                  className={
                    state === 'done'
                      ? 'text-muted-foreground line-through decoration-muted-foreground/40'
                      : state === 'active'
                      ? [
                          'font-medium',
                          isUploadItem ? 'text-blue-600' : 'text-foreground',
                        ].join(' ')
                      : 'text-muted-foreground/60'
                  }
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
