import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-foreground mb-1.5', className)}
      {...props}
    />
  )
}
