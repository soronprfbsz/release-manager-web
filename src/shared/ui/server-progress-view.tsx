/**
 * ServerProgressView
 *
 * 서버 처리 진행 중 표시되는 공용 컴포넌트.
 * 폼 입력 영역을 대체하여 단계별 체크리스트 + 진행 bar 를 표시.
 *
 * 사용처: 패치 생성, 버전 생성, 빌드 생성 등 모든 장시간 서버 작업.
 */

import { Check, Loader2, Server } from 'lucide-react'

import type { ProgressResponse } from '@/shared/api/progress/types'

interface ServerProgressViewProps {
  /** 진행 상황. null/undefined 면 "시작 중" 상태로 표시 */
  progress?: ProgressResponse | null
  /** 헤더 타이틀 (기본: "처리 중") */
  title?: string
  /** 완료 타이틀 (기본: "처리 완료") */
  completedTitle?: string
  /** 하단 안전 안내 문구 (기본 문구 사용) */
  safetyMessage?: string
  /**
   * 단계 라벨 배열 — 체크리스트 미리보기용.
   * 미전달 시 progress.totalSteps 수만큼 "단계 N" 형식으로 자동 생성.
   * backend 의 실제 메시지는 progress.message 로 표시되므로
   * 라벨이 정확하지 않아도 UX 에 영향 없음.
   * readonly 배열도 허용 (as const 배열 전달 가능).
   */
  steps?: readonly string[]
}

export function ServerProgressView({
  progress,
  title = '처리 중',
  completedTitle = '처리 완료',
  safetyMessage,
  steps,
}: ServerProgressViewProps) {
  const step = progress?.step ?? 0
  const rawTotalSteps = progress?.totalSteps ?? 0
  const message = progress?.message ?? '시작 중...'
  const completed = progress?.completed === true

  // 체크리스트 표시용 라벨 결정 (readonly 배열도 허용하기 위해 전개)
  const resolvedSteps: string[] =
    steps && steps.length > 0
      ? [...steps]
      : Array.from(
          { length: rawTotalSteps > 0 ? rawTotalSteps : 1 },
          (_, i) => `단계 ${i + 1}`
        )

  const totalSteps = resolvedSteps.length > 0 ? resolvedSteps.length : 1
  const percent = Math.min(100, Math.round((step / totalSteps) * 100))

  const defaultSafetyMessage = completed
    ? '잠시 후 화면이 자동으로 닫힙니다.'
    : '진행 중인 작업이 끝날 때까지 창을 닫지 말고 기다려주세요.'

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* 헤더 — spinner / 완료 아이콘 + 타이틀 */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {completed ? (
            <Check className="h-8 w-8 text-primary" strokeWidth={2.5} />
          ) : (
            <>
              <Server className="h-7 w-7 text-primary" />
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

      {/* 진행 카운터 + progress bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {step}
            <span className="text-base font-normal text-muted-foreground">
              {' / '}{totalSteps}
            </span>
          </span>
          <span className="font-mono text-sm font-medium text-primary">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>

      {/* 단계 체크리스트 */}
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">처리 단계</p>
        <ul className="space-y-1.5">
          {resolvedSteps.map((label, idx) => {
            const stepNo = idx + 1
            const state =
              completed
                ? 'done'
                : stepNo < step
                ? 'done'
                : stepNo === step
                ? 'active'
                : 'pending'
            return (
              <li key={`${label}-${idx}`} className="flex items-center gap-2 text-xs">
                <span
                  className={
                    state === 'done'
                      ? 'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'
                      : state === 'active'
                      ? 'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary'
                      : 'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-muted-foreground/30'
                  }
                >
                  {state === 'done' && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  {state === 'active' && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  )}
                </span>
                <span
                  className={
                    state === 'done'
                      ? 'text-muted-foreground line-through decoration-muted-foreground/40'
                      : state === 'active'
                      ? 'font-medium text-foreground'
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
