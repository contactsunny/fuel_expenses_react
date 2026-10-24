import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Spinner({ className }) {
    return (_jsxs("svg", { className: cn('h-5 w-5 animate-spin text-accent', className), viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })] }));
}
export function Skeleton({ className }) {
    return _jsx("div", { className: cn('rounded-[var(--radius-card)] animate-shimmer', className), "aria-hidden": true });
}
export function PageLoading({ label = 'Loading…' }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground", role: "status", children: [_jsx(Spinner, { className: "h-6 w-6" }), _jsx("p", { className: "text-sm", children: label })] }));
}
