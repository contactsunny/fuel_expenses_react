import type { HTMLAttributes, ReactNode, MouseEvent } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Dialog({ open, onClose, title, children, className, size = 'md' }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className={cn(
          'relative z-10 w-full rounded-2xl border border-border bg-surface-elevated shadow-xl shadow-black/20',
          'animate-scale-in max-h-[90vh] overflow-y-auto',
          sizeClass[size],
          className
        )}
        onClick={stop}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
          {title ? (
            <h2 id="dialog-title" className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          ) : (
            <span className="sr-only">Dialog</span>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="shrink-0 -mr-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-3 pt-4 mt-2 border-t border-border', className)} {...props} />
}
