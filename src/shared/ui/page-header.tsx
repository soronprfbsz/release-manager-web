import * as React from 'react'
import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-slate-200 dark:border-slate-800',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-primary/10">{icon}</div>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
