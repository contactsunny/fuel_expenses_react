import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface StatChipProps {
  children: ReactNode
  className?: string
  /** Compact inline chip (default) or metric-card style block for KPI grids */
  variant?: 'chip' | 'metric'
  label?: string
}

export function StatChip({ children, className, variant = 'chip', label }: StatChipProps) {
  if (variant === 'metric') {
    return (
      <div className={cn('metric-card px-3.5 py-3 md:px-4 md:py-3.5', className)}>
        {label ? <p className="metric-label">{label}</p> : null}
        <div className={cn('metric-value', label && 'mt-1')}>{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[var(--radius-control)] bg-accent-muted px-2.5 py-1.5 text-xs font-medium text-accent md:text-sm md:px-3',
        className
      )}
    >
      {children}
    </div>
  )
}
