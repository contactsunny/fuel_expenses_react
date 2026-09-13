import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  padding?: boolean
}

export function Card({ className, children, padding = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border bg-surface shadow-sm shadow-black/[0.04] dark:shadow-black/25',
        padding && 'p-4 md:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
