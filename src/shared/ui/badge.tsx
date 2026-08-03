import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/**
 * Backstage-style badge.
 *  - Default radius: rounded (4px). Pill 변형은 size="pill"
 *  - Category badges (database/web/engine/etc): mono uppercase, slight border tint
 *    (Backstage rm-cat 와 동등). Untitled-UI 의 soft semantic 색상 사용.
 *  - Status badges (success/warning/info/destructive 등) 은 기존 패턴 유지
 */
const badgeVariants = cva(
  "inline-flex items-center rounded border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive",
        outline: "border-border text-foreground bg-transparent",
        /** DB — Backstage blue */
        database:
          "border-blue-500/40 text-blue-700 bg-blue-50 font-mono uppercase tracking-wider dark:border-blue-400/40 dark:text-blue-300 dark:bg-blue-950/40",
        /** WEB — Backstage success green */
        web:
          "border-emerald-500/40 text-emerald-700 bg-emerald-50 font-mono uppercase tracking-wider dark:border-emerald-400/40 dark:text-emerald-300 dark:bg-emerald-950/40",
        /** ENG — Backstage violet */
        engine:
          "border-violet-500/40 text-violet-700 bg-violet-50 font-mono uppercase tracking-wider dark:border-violet-400/40 dark:text-violet-300 dark:bg-violet-950/40",
        /** ETC — Backstage gray */
        etc:
          "border-border text-foreground/70 bg-muted font-mono uppercase tracking-wider",
        latest:
          "border-amber-500/40 text-amber-700 bg-amber-50 dark:border-amber-400/40 dark:text-amber-300 dark:bg-amber-950/40",
        install:
          "border-rose-500/40 text-rose-700 bg-rose-50 dark:border-rose-400/40 dark:text-rose-300 dark:bg-rose-950/40",
        /** 성공/활성/승인됨 — primary 톤 */
        success:
          "border-transparent bg-primary/20 text-primary",
        /** 경고/미승인 */
        warning:
          "border-transparent bg-yellow-500/10 text-yellow-700 dark:text-yellow-500",
        /** 정보/안내 */
        info:
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400",
        /** 비활성/중립 */
        neutral:
          "border-transparent bg-muted text-muted-foreground",
      },
      size: {
        /** 기본 — 일반 카테고리/상태 라벨 (Backstage rm-cat 18px height) */
        default: "h-[18px] px-1.5 text-[10px] leading-none",
        /** 컴팩트 — 트리 노드 뱃지 */
        sm: "h-[16px] text-[10px] px-1 leading-none",
        /** 둥근 캡슐 — status pill 류 */
        pill: "h-[22px] rounded-full px-2.5 py-0.5 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** true 면 좌측에 5px 원형 dot 표시 (variant 색에 따라 자동) */
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 h-[5px] w-[5px] rounded-full bg-current flex-shrink-0" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
