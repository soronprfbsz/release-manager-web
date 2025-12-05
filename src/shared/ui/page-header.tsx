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
        'flex items-center justify-between p-6 rounded-lg border border-border bg-gradient-to-r',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(to right, hsl(var(--header-bg)), hsl(var(--header-bg) / 0.5))`
      }}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
