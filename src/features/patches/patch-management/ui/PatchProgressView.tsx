/**
 * PatchProgressView
 * 패치 생성 진행 중 표시되는 큰 영역 — 폼 입력을 대체.
 *
 * 사용자 체감 향상 목적:
 *  - 기존: 버튼 텍스트 "패치 생성 중..." + 작은 spinner 만
 *  - 신규: 단계 indicator / progress bar / 현재 메시지 / 8단계 체크리스트 / 안내
 *  - 오프캔버스 닫을 수 없는 상황 (lock) 임을 안내해 안심하고 기다리도록
 */

import { Check, Loader2, PackageOpen } from 'lucide-react'

import type { PatchProgress } from '@/entities/patches/patch'

interface PatchProgressViewProps {
  /** 진행 상황. null/undefined 면 "시작 중" 상태로 표시 */
  progress?: PatchProgress | null
}

/**
 * backend 의 8단계 메시지와 매칭되는 클라이언트측 step 라벨.
 * backend 가 update(step, totalSteps, message) 로 보내는 message 를 그대로
 * 표시해도 되지만, "예정된 단계 전체 보기" 를 위해 라벨 리스트를 클라이언트에 둠.
 *
 * backend 와 어긋나도 표시만 차이 — 실제 진행은 backend 의 step 숫자로 결정.
 */
const STEP_LABELS = [
  '버전 범위 검증',
  '출력 디렉토리 생성',
  'DB 누적 변경 파일 복사',
  'WEB / ENGINE 빌드 파일 복사',
  '빌드 공유 자산 동반',
  '패치 스크립트 생성',
  'README / 빌드 메타 생성',
  'DB 메타 저장',
] as const

const TOTAL = STEP_LABELS.length

export function PatchProgressView({ progress }: PatchProgressViewProps) {
  const step = progress?.step ?? 0
  const totalSteps = progress?.totalSteps && progress.totalSteps > 0 ? progress.totalSteps : TOTAL
  const message = progress?.message ?? '시작 중...'
  const percent = totalSteps > 0 ? Math.min(100, Math.round((step / totalSteps) * 100)) : 0
  const completed = progress?.completed === true

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* 헤더 — 큰 spinner / 아이콘 + 타이틀 */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {completed ? (
            <Check className="h-8 w-8 text-primary" strokeWidth={2.5} />
          ) : (
            <>
              <PackageOpen className="h-7 w-7 text-primary" />
              <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-primary/30" strokeWidth={1.5} />
            </>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-foreground">
            {completed ? '패치 생성 완료' : '패치 생성 중'}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {completed
              ? '잠시 후 화면이 자동으로 닫힙니다.'
              : '진행 중인 작업이 끝날 때까지 창을 닫지 말고 기다려주세요.'}
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

      {/* 8단계 체크리스트 */}
      <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground">처리 단계</p>
        <ul className="space-y-1.5">
          {STEP_LABELS.map((label, idx) => {
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
              <li key={label} className="flex items-center gap-2 text-xs">
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
