import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Card({ className, children, padding = true, ...props }) {
    return (_jsx("div", { className: cn('rounded-[var(--radius-card)] border border-border bg-surface shadow-sm shadow-black/[0.04] dark:shadow-black/25', padding && 'p-4 md:p-5', className), ...props, children: children }));
}
