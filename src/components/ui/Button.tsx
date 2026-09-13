import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children?: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:brightness-105 shadow-sm shadow-accent/25 disabled:opacity-50',
  secondary:
    'bg-muted text-foreground hover:bg-border/70 disabled:opacity-50',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
  danger:
    'bg-danger text-danger-foreground hover:brightness-110 disabled:opacity-50',
  outline:
    'bg-surface border border-border text-foreground hover:bg-muted disabled:opacity-50',
}

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-[var(--radius-control)] md:h-8',
  md: 'h-10 px-3.5 text-sm gap-2 rounded-[var(--radius-control)] md:h-9',
  lg: 'h-11 px-4 text-sm gap-2 rounded-[var(--radius-card)] md:h-10',
  icon: 'h-10 w-10 rounded-[var(--radius-control)] inline-flex items-center justify-center md:h-9 md:w-9',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
