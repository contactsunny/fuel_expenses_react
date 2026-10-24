import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function PageHeader({ title, description, actions, className }) {
    return (_jsxs("div", { className: cn('flex flex-wrap items-start justify-between gap-3', className), children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "app-title text-xl md:text-2xl", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] }), actions && _jsx("div", { className: "flex items-center gap-2 shrink-0", children: actions })] }));
}
