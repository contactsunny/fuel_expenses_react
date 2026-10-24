import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Alert({ tone = 'danger', className, children, ...props }) {
    return (_jsx("div", { role: "alert", className: cn('rounded-[var(--radius-card)] border px-3 py-2.5 text-sm', tone === 'danger' && 'border-danger/30 bg-danger-muted text-danger', tone === 'muted' && 'border-border bg-muted text-muted-foreground', tone === 'accent' && 'border-accent/25 bg-accent-muted text-accent', className), ...props, children: children }));
}
