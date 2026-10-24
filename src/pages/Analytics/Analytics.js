import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { Fuel, IndianRupee, Tags } from 'lucide-react';
import { Card } from '../../components/ui';
const views = [
    {
        to: '/live/analytics/vehicleCategory',
        title: 'Vehicle Category',
        description: 'Spend breakdown by vehicle category for the last 6 months.',
        icon: Tags,
    },
    {
        to: '/live/analytics/fuelPrice',
        title: 'Fuel Price',
        description: 'Unit price movement for petrol and diesel over time.',
        icon: IndianRupee,
    },
    {
        to: '/live/analytics/vsChart',
        title: 'Fuel Type',
        description: 'Compare total spend across fuel types.',
        icon: Fuel,
    },
];
export default function Analytics() {
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Insights" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Analytics" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: "Explore spend insights across your fleet." })] }), _jsx("div", { className: "grid gap-3 md:grid-cols-3", children: views.map(({ to, title, description, icon: Icon }) => (_jsx(NavLink, { to: to, className: "group block focus-visible:outline-none", children: _jsxs(Card, { className: "h-full transition-colors group-hover:border-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-ring", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] bg-accent-muted text-accent", children: _jsx(Icon, { className: "h-5 w-5", "aria-hidden": true }) }), _jsx("h2", { className: "mt-4 text-base font-semibold text-foreground", children: title }), _jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: description }), _jsx("p", { className: "mt-4 text-sm font-medium text-accent", children: "Open view" })] }) }, to))) })] }));
}
