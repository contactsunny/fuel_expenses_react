import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wrench } from 'lucide-react';
import { Card, EmptyState } from '../components/ui';
export default function ServiceRecords() {
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Maintenance" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Service Records" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: "Maintenance and service history for your vehicles." })] }), _jsx(Card, { padding: false, className: "section-panel", children: _jsx(EmptyState, { icon: _jsx(Wrench, { className: "h-5 w-5" }), title: "Coming soon", description: "Service history will appear here in a future update. This screen is not editable yet." }) })] }));
}
