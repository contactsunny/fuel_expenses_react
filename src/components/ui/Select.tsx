import type { CSSProperties, SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, style, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full min-w-0 h-10 px-3 text-sm rounded-md appearance-none md:h-9',
        'bg-surface border border-border text-foreground',
        'hover:border-muted-foreground/40',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-150',
        'bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b949e'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
        paddingRight: '2rem',
        ...(style as CSSProperties | undefined),
      }}
      {...props}
    >
      {children}
    </select>
  )
}
