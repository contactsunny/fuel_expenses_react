import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
  tone?: 'neutral' | 'accent' | 'danger' | 'success'
}

const tones = {
  neutral: 'bg-muted text-muted-foreground',
  accent: 'bg-accent-muted text-accent',
  danger: 'bg-danger-muted text-danger',
  success: 'bg-success/15 text-success',
}

export function Badge({ className, children, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
