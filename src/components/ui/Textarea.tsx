import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full min-w-0 px-3 py-2 text-sm rounded-md resize-y',
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
