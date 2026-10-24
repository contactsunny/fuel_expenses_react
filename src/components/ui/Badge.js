import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
const tones = {
    neutral: 'bg-muted text-muted-foreground',
    accent: 'bg-accent-muted text-accent',
    danger: 'bg-danger-muted text-danger',
    success: 'bg-success/15 text-success',
};
export function Badge({ className, children, tone = 'neutral', ...props }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-[var(--radius-control)] px-2 py-0.5 text-xs font-medium', tones[tone], className), ...props, children: children }));
}
