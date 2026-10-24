import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function EmptyState({ icon, title, description, action, className }) {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center text-center px-6 py-14', className), children: [icon && (_jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-muted text-accent", children: icon })), _jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }), description && _jsx("p", { className: "mt-1.5 max-w-sm text-sm text-muted-foreground", children: description }), action && _jsx("div", { className: "mt-4", children: action })] }));
}
