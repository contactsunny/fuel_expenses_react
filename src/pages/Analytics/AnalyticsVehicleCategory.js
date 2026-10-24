import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, PageLoading, EmptyState, Alert } from '../../components/ui';
import { getCategoryAnalytics } from '../../services/analytics';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
export default function AnalyticsVehicleCategory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    useEffect(() => {
        const onResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 6);
        setLoading(true);
        getCategoryAnalytics(start, end)
            .then((res) => {
            // API response format: { status, message, error, data: [{ vehicleCategoryId, vehicleCategoryName, total }] }
            const responseData = res.data?.data;
            if (!Array.isArray(responseData)) {
                setError('Invalid data format');
                return;
            }
            // Map vehicleCategoryName and total to name and value
            const normalized = responseData.map((it) => ({
                name: it.vehicleCategoryName ?? it.categoryName ?? 'Unknown',
                value: Number(it.total ?? 0)
            }));
            setData(normalized);
        })
            .catch((err) => {
            console.error('Analytics error:', err);
            setError('Failed to load analytics');
        })
            .finally(() => setLoading(false));
    }, []);
    const COLORS = ['#2563eb', '#60a5fa', '#0e9f6e', '#f59e0b', '#ef4444', '#6366f1', '#38bdf8', '#84cc16'];
    const isMobile = screenWidth < 768;
    const outerRadius = isMobile ? 80 : 120;
    const innerRadius = isMobile ? 40 : 60;
    const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-surface-elevated border border-border rounded-lg shadow-lg p-3", children: [_jsx("p", { className: "font-medium text-foreground", children: payload[0].name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Amount: ", _jsx("span", { className: "font-semibold", children: money.format(payload[0].value) })] })] }));
        }
        return null;
    };
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Analytics" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Vehicle Category" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: "Spend distribution by vehicle category." })] }), _jsxs(Card, { padding: false, className: "section-panel p-4 md:p-6", children: [loading && _jsx(PageLoading, { label: "Loading\u2026" }), error && _jsx(Alert, { className: "m-2", children: error }), !loading && !error && data.length === 0 && (_jsx(EmptyState, { title: "No data available", description: "There is nothing to show for the last 6 months." })), !loading && !error && data.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "mb-3 px-1 text-sm text-muted-foreground", children: ["Category spend for the last 6 months across ", data.length, " categories."] }), _jsx("div", { className: isMobile ? "h-96" : "h-96 md:h-[500px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: outerRadius, innerRadius: innerRadius, paddingAngle: 2, label: ({ name, value }) => `${name}: ₹${Math.round(value).toLocaleString('en-IN')}`, labelLine: false, children: data.map((_, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, index))) }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, { verticalAlign: isMobile ? "bottom" : "middle", align: isMobile ? "center" : "right", layout: isMobile ? "horizontal" : "vertical", wrapperStyle: { fontSize: '12px' }, iconType: "circle" })] }) }) })] }))] })] }));
}
