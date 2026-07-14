import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface StatChipProps {
  children: ReactNode
  className?: string
}

export function StatChip({ children, className }: StatChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-accent-muted px-2.5 py-1.5 text-xs font-medium text-accent md:text-sm md:px-3',
        className
      )}
    >
      {children}
    </div>
  )
}
