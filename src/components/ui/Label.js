import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
export function Label({ className, ...props }) {
    return (_jsx("label", { className: cn('block text-sm font-medium text-foreground mb-1.5', className), ...props }));
}
