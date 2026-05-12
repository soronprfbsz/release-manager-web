import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow",
        outline: "border-foreground text-foreground",
        database:
          "border-blue-600 text-blue-600 bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/90",
        web:
          "border-emerald-600 text-emerald-600 bg-emerald-100 dark:border-emerald-400 dark:text-emerald-400 dark:bg-emerald-950/90",
        engine:
          "border-violet-600 text-violet-600 bg-violet-100 dark:border-violet-400 dark:text-violet-400 dark:bg-violet-950/90",
        etc:
          "border-slate-600 text-slate-600 bg-slate-100 dark:border-slate-400 dark:text-slate-400 dark:bg-slate-950/90",
        latest:
          "border-amber-500 text-amber-700 bg-amber-100 dark:border-amber-400 dark:text-amber-300 dark:bg-amber-950/90",
        install:
          "border-rose-500 text-rose-700 bg-rose-100 dark:border-rose-400 dark:text-rose-300 dark:bg-rose-950/90",
        /** 성공/활성/승인됨 — primary 톤 */
        success:
          "border-transparent bg-primary/10 text-primary",
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
        /** 기본 크기 — 일반 카테고리/상태 라벨 */
        default: "px-2.5 py-0.5 text-xs",
        /** 컴팩트 — 테이블 셀 카테고리 pill, 트리 노드 뱃지 */
        sm: "h-[18px] text-[10px] px-1.5 py-0 leading-none rounded-sm",
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
