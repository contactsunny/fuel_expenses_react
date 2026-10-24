import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Input({ className, ...props }) {
    return (_jsx("input", { className: cn('w-full min-w-0 h-11 px-3 text-sm rounded-[var(--radius-control)] md:h-10', 'bg-surface border border-border text-foreground placeholder:text-muted-foreground', 'hover:border-muted-foreground/40', 'focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent', 'disabled:opacity-50 disabled:cursor-not-allowed', 'transition-colors duration-150', className), ...props }));
}
