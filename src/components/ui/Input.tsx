import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        // iOS Safari zooms the page when a focused form control uses <16px text.
        // Keep the rendered size at 16px on mobile, even if a caller adds text-sm.
        'block w-full min-w-0 max-w-full h-11 px-3 text-base rounded-[var(--radius-control)] md:h-10 md:text-sm',
        'bg-surface border border-border text-foreground placeholder:text-muted-foreground',
        'hover:border-muted-foreground/40',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-150',
        className
      )}
      {...props}
    />
  )
}
