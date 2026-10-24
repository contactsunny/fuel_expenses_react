import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function StatChip({ children, className, variant = 'chip', label }) {
    if (variant === 'metric') {
        return (_jsxs("div", { className: cn('metric-card px-3.5 py-3 md:px-4 md:py-3.5', className), children: [label ? _jsx("p", { className: "metric-label", children: label }) : null, _jsx("div", { className: cn('metric-value', label && 'mt-1'), children: children })] }));
    }
    return (_jsx("div", { className: cn('inline-flex items-center rounded-[var(--radius-control)] bg-accent-muted px-2.5 py-1.5 text-xs font-medium text-accent md:text-sm md:px-3', className), children: children }));
}
