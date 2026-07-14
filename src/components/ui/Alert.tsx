import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'danger' | 'muted'
  children: ReactNode
}

export function Alert({ tone = 'danger', className, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-3 py-2.5 text-sm',
        tone === 'danger' && 'border-danger/30 bg-danger-muted text-danger',
        tone === 'muted' && 'border-border bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
