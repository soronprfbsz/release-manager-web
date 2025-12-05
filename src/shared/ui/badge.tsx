import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "border-foreground text-foreground",
        database:
          "border-blue-600 text-blue-600 bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/90",
        web:
          "border-emerald-600 text-emerald-600 bg-emerald-100 dark:border-emerald-400 dark:text-emerald-400 dark:bg-emerald-950/90",
        engine:
          "border-violet-600 text-violet-600 bg-violet-100 dark:border-violet-400 dark:text-violet-400 dark:bg-violet-950/90",
        etc:
          "border-slate-600 text-slate-600 bg-slate-100 dark:border-slate-400 dark:text-slate-400 dark:bg-slate-950/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
