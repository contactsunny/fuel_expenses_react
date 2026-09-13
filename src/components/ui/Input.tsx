import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full min-w-0 h-11 px-3 text-sm rounded-[var(--radius-control)] md:h-10',
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
