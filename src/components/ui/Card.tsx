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
        'rounded-lg border border-border bg-surface shadow-sm shadow-black/[0.03] dark:shadow-black/20',
        padding && 'p-4 md:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
