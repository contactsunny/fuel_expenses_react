import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, PageLoading, EmptyState, Alert } from '../../components/ui';
import { getFuelPriceAnalytics } from '../../services/analytics';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
export default function AnalyticsFuelPrice() {
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
        getFuelPriceAnalytics(start, end)
            .then((res) => {
            // API response format: { status, message, error, data: { PETROL: [...], DIESEL: [...] } }
            const dataObj = res.data?.data;
            // Log the response for debugging
            if (import.meta.env.DEV) {
                console.log('Fuel Price Analytics API Response:', res.data);
            }
            if (!dataObj || typeof dataObj !== 'object') {
                console.error('Unexpected API response format:', res.data);
                setError('Invalid data format. Check console for details.');
                return;
            }
            const petrolData = Array.isArray(dataObj.PETROL) ? dataObj.PETROL : [];
            const dieselData = Array.isArray(dataObj.DIESEL) ? dataObj.DIESEL : [];
            if (petrolData.length === 0 && dieselData.length === 0) {
                setData([]);
                return;
            }
            // Helper function to construct date string from date, month, year
            const constructDate = (it) => {
                const day = String(it.date ?? it.day ?? '').padStart(2, '0');
                const month = String(it.month ?? '').padStart(2, '0');
                const year = String(it.year ?? '');
                if (day && month && year) {
                    // Format as "dd MMM" for display (e.g., "06 Jun")
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const monthIndex = parseInt(month, 10) - 1;
                    const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month;
                    return `${day} ${monthName}`;
                }
                // Fallback to existing date field if available
                return it.date ?? it.day ?? it.label ?? it.period ?? it.time ?? '';
            };
            // Helper function to get cost value
            const getCost = (it) => {
                return Number(it.cost ?? it.price ?? it.value ?? it.amount ?? 0);
            };
            // Get all unique dates from both arrays
            const allDates = new Set();
            petrolData.forEach((it) => {
                const date = constructDate(it);
                if (date)
                    allDates.add(date);
            });
            dieselData.forEach((it) => {
                const date = constructDate(it);
                if (date)
                    allDates.add(date);
            });
            // Create a map for quick lookup
            const petrolMap = new Map();
            petrolData.forEach((it) => {
                const date = constructDate(it);
                const cost = getCost(it);
                if (date)
                    petrolMap.set(date, cost);
            });
            const dieselMap = new Map();
            dieselData.forEach((it) => {
                const date = constructDate(it);
                const cost = getCost(it);
                if (date)
                    dieselMap.set(date, cost);
            });
            // Helper function to create sort key from date string (dd MMM format)
            const createSortKey = (dateStr) => {
                // Find the original data point to get year, month, day
                const found = [...petrolData, ...dieselData].find((it) => {
                    const day = String(it.date ?? it.day ?? '').padStart(2, '0');
                    const month = String(it.month ?? '').padStart(2, '0');
                    const year = String(it.year ?? '');
                    if (day && month && year) {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month;
                        const formatted = `${day} ${monthName}`;
                        return formatted === dateStr;
                    }
                    return false;
                });
                if (found) {
                    const day = String(found.date ?? found.day ?? '').padStart(2, '0');
                    const month = String(found.month ?? '').padStart(2, '0');
                    const year = String(found.year ?? '');
                    return `${year}${month}${day}`;
                }
                return dateStr;
            };
            // Combine data by date and sort chronologically
            const normalized = Array.from(allDates).map((date) => {
                const entry = { date };
                entry.petrol = petrolMap.get(date) ?? null;
                if (dieselData.length > 0) {
                    entry.diesel = dieselMap.get(date) ?? null;
                }
                // Store sort key for chronological sorting
                entry._sortKey = createSortKey(date);
                return entry;
            }).sort((a, b) => {
                // Sort by date chronologically
                if (a._sortKey < b._sortKey)
                    return -1;
                if (a._sortKey > b._sortKey)
                    return 1;
                return 0;
            }).map(({ _sortKey, ...entry }) => entry); // Remove sort key from final data
            setData(normalized);
        })
            .catch((err) => {
            console.error('Analytics error:', err);
            setError('Failed to load analytics');
        })
            .finally(() => setLoading(false));
    }, []);
    const isMobile = screenWidth < 768;
    const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
    // Calculate intelligent Y-axis range
    const calculateYAxisDomain = () => {
        if (data.length === 0)
            return [0, 100];
        // Get all values (petrol and diesel)
        const allValues = [];
        data.forEach((d) => {
            if (d.petrol !== null && d.petrol !== undefined)
                allValues.push(d.petrol);
            if (d.diesel !== null && d.diesel !== undefined)
                allValues.push(d.diesel);
        });
        if (allValues.length === 0)
            return [0, 100];
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        // Add padding (10% on top and bottom)
        const range = maxValue - minValue;
        const padding = range * 0.1;
        // Round to nice numbers
        const minDomain = Math.max(0, Math.floor((minValue - padding) / 10) * 10);
        const maxDomain = Math.ceil((maxValue + padding) / 10) * 10;
        return [minDomain, maxDomain];
    };
    const yAxisDomain = calculateYAxisDomain();
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (_jsxs("div", { className: "bg-surface-elevated border border-border rounded-lg shadow-lg p-3", children: [_jsx("p", { className: "font-medium text-foreground mb-2", children: data.date }), _jsxs("div", { className: "space-y-1 text-sm", children: [data.petrol !== null && data.petrol !== undefined && (_jsxs("p", { className: "text-muted-foreground", children: ["Petrol: ", _jsx("span", { className: "font-semibold text-foreground", children: money.format(data.petrol) })] })), data.diesel !== null && data.diesel !== undefined && (_jsxs("p", { className: "text-muted-foreground", children: ["Diesel: ", _jsx("span", { className: "font-semibold text-foreground", children: money.format(data.diesel) })] }))] })] }));
        }
        return null;
    };
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Analytics" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Fuel Price" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: "Price movement for the last 6 months." })] }), _jsxs(Card, { padding: false, className: "section-panel p-4 md:p-6", children: [loading && _jsx(PageLoading, { label: "Loading\u2026" }), error && _jsx(Alert, { className: "m-2", children: error }), !loading && !error && data.length === 0 && (_jsx(EmptyState, { title: "No data available", description: "There is nothing to show for the last 6 months." })), !loading && !error && data.length > 0 && (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-3 px-1 text-sm text-muted-foreground", children: "Petrol and diesel unit prices over the last 6 months." }), _jsx("div", { className: isMobile ? "h-80" : "h-96 md:h-[500px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, margin: { left: isMobile ? 8 : 12, right: isMobile ? 8 : 12, top: 12, bottom: isMobile ? 8 : 12 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "colorPetrol", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#2563eb", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#2563eb", stopOpacity: 0.1 })] }), _jsxs("linearGradient", { id: "colorDiesel", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#60a5fa", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#60a5fa", stopOpacity: 0.1 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#30363d", strokeOpacity: 0.5 }), _jsx(XAxis, { dataKey: "date", interval: isMobile ? Math.max(0, Math.floor(data.length / 6)) : 0, angle: isMobile ? -45 : 0, textAnchor: isMobile ? "end" : "middle", height: isMobile ? 60 : 30, tick: { fontSize: isMobile ? 9 : 11, fill: '#8b949e' }, stroke: "#8b949e" }), _jsx(YAxis, { domain: yAxisDomain, tick: { fontSize: isMobile ? 10 : 12, fill: '#8b949e' }, stroke: "#8b949e" }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, { wrapperStyle: { fontSize: '12px' }, iconType: "line" }), _jsx(Area, { type: "monotone", dataKey: "petrol", stroke: "#2563eb", strokeWidth: 2, fill: "url(#colorPetrol)", name: "Petrol" }), data.some((d) => d.diesel !== null && d.diesel !== undefined) && (_jsx(Area, { type: "monotone", dataKey: "diesel", stroke: "#60a5fa", strokeWidth: 2, fill: "url(#colorDiesel)", name: "Diesel" }))] }) }) })] }))] })] }));
}
