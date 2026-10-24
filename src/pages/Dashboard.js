import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Filter, Pencil, Trash2, ChevronLeft, ChevronRight, ClipboardList, CalendarDays, IndianRupee, Fuel, Hash, Gauge } from 'lucide-react';
import { getUserFuel, deleteFuel } from '../services/fuel';
import { getUserVehicles } from '../services/vehicles';
import { getUserVehicleCategories } from '../services/vehicleCategories';
import { useFuelRecord } from '../contexts/FuelRecordContext';
import DateRangePicker from '../components/DateRangePicker';
import { toTitleCase } from '../utils/formatters';
import { Button, Select, Label, Card, Dialog, DialogFooter, Badge, PageLoading, EmptyState, Alert, StatChip, } from '../components/ui';
export default function Dashboard() {
    const [allRows, setAllRows] = useState([]);
    const [rows, setRows] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, record: null });
    const [deleting, setDeleting] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedFuelType, setSelectedFuelType] = useState('');
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const { setEditingRecord, setShowFuelForm, refreshTrigger, triggerRefresh } = useFuelRecord();
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const fmt = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: undefined }), []);
    const money = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }), []);
    const moneyInteger = useMemo(() => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), []);
    useEffect(() => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 6);
        setDateFrom(start.toISOString().split('T')[0]);
        setDateTo(end.toISOString().split('T')[0]);
    }, []);
    useEffect(() => {
        const onResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        Promise.all([
            getUserVehicles(),
            getUserVehicleCategories(),
        ])
            .then(([vehiclesRes, catsRes]) => {
            const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data);
            const vehiclesList = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : [];
            const catsPayload = (catsRes.data?.data ?? catsRes.data);
            const categoriesList = Array.isArray(catsPayload) ? catsPayload : Array.isArray(catsPayload?.items) ? catsPayload.items : [];
            setVehicles(vehiclesList);
            setCategories(categoriesList);
        })
            .catch(() => console.error('Failed to load vehicles/categories'));
    }, []);
    useEffect(() => {
        if (!dateFrom || !dateTo)
            return;
        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        setLoading(true);
        getUserFuel(start, end)
            .then((fuelRes) => {
            const fuelPayload = (fuelRes.data?.data ?? fuelRes.data);
            const fuelItems = Array.isArray(fuelPayload) ? fuelPayload : Array.isArray(fuelPayload?.items) ? fuelPayload.items : [];
            const vehicleIdToVehicle = new Map();
            for (const v of vehicles) {
                const id = String(v.id ?? v._id ?? v.vehicleId ?? '');
                if (!id)
                    continue;
                vehicleIdToVehicle.set(id, v);
            }
            const categoryIdToName = new Map();
            for (const c of categories) {
                const id = String(c.id ?? c._id ?? c.categoryId ?? '');
                const name = String(c.name ?? c.title ?? c.categoryName ?? 'Unknown');
                if (!id)
                    continue;
                categoryIdToName.set(id, name);
            }
            const enriched = fuelItems.map((r) => {
                const vehicleId = String(r.vehicleId ?? r.vehicle?.id ?? r.vehicle?.vehicleId ?? '');
                const vehicle = vehicleId ? vehicleIdToVehicle.get(vehicleId) : undefined;
                const vehicleName = r.vehicleName ?? r.vehicle?.name ?? vehicle?.name ?? vehicle?.vehicleName ?? '';
                const categoryId = String(r.vehicleCategoryId ?? r.categoryId ?? r.vehicle?.categoryId ?? vehicle?.categoryId ?? '');
                const categoryName = categoryId ? (categoryIdToName.get(categoryId) ?? '') : '';
                return { ...r, vehicleName, vehicleCategoryName: categoryName, vehicleId: vehicleId || r.vehicleId, categoryId: categoryId || r.vehicleCategoryId };
            });
            setAllRows(enriched);
        })
            .catch(() => setError('Failed to load records'))
            .finally(() => setLoading(false));
    }, [dateFrom, dateTo, refreshTrigger, vehicles, categories]);
    useEffect(() => {
        let filtered = [...allRows];
        if (selectedVehicle) {
            filtered = filtered.filter(r => {
                const vehicleId = String(r.vehicleId ?? r.vehicle?.id ?? r.vehicle?.vehicleId ?? '');
                return vehicleId === selectedVehicle;
            });
        }
        if (selectedCategory) {
            filtered = filtered.filter(r => {
                const categoryId = String(r.vehicleCategoryId ?? r.categoryId ?? r.vehicle?.categoryId ?? r.categoryId ?? '');
                return categoryId === selectedCategory;
            });
        }
        if (selectedFuelType) {
            filtered = filtered.filter(r => {
                const fuelType = String(r.fuelType ?? r.type ?? '').toUpperCase();
                return fuelType === selectedFuelType.toUpperCase();
            });
        }
        if (selectedPaymentType) {
            filtered = filtered.filter(r => {
                const paymentType = String(r.paymentType ?? '').toUpperCase();
                return paymentType === selectedPaymentType.toUpperCase();
            });
        }
        setRows(filtered);
    }, [allRows, selectedVehicle, selectedCategory, selectedFuelType, selectedPaymentType]);
    const handleEdit = (record) => {
        setEditingRecord(record);
        setShowFuelForm(true);
    };
    const handleDelete = (record) => {
        setDeleteConfirm({ show: true, record });
    };
    const confirmDelete = async () => {
        if (!deleteConfirm.record)
            return;
        const recordId = deleteConfirm.record.id ?? deleteConfirm.record._id;
        if (!recordId) {
            setDeleteConfirm({ show: false, record: null });
            return;
        }
        setDeleting(true);
        try {
            await deleteFuel(String(recordId));
            triggerRefresh();
            setDeleteConfirm({ show: false, record: null });
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to delete record');
        }
        finally {
            setDeleting(false);
        }
    };
    const handleResetFilters = () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - 6);
        setDateFrom(start.toISOString().split('T')[0]);
        setDateTo(end.toISOString().split('T')[0]);
        setSelectedVehicle('');
        setSelectedCategory('');
        setSelectedFuelType('');
        setSelectedPaymentType('');
        setShowFiltersModal(false);
    };
    const isMobile = screenWidth < 768;
    const fuelTypes = useMemo(() => {
        const types = new Set();
        allRows.forEach(r => {
            const fuelType = r.fuelType ?? r.type;
            if (fuelType)
                types.add(String(fuelType).toUpperCase());
        });
        return Array.from(types).sort();
    }, [allRows]);
    const paymentTypes = useMemo(() => {
        const types = new Set();
        allRows.forEach(r => {
            const paymentType = r.paymentType;
            if (paymentType)
                types.add(String(paymentType).toUpperCase());
        });
        return Array.from(types).sort();
    }, [allRows]);
    const totalAmount = useMemo(() => {
        return rows.reduce((sum, r) => {
            const amount = r.amount ?? r.price ?? r.cost ?? 0;
            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
        }, 0);
    }, [rows]);
    const totalLitres = useMemo(() => {
        return rows.reduce((sum, r) => {
            const litres = r.litres ?? r.liters ?? r.volume ?? r.quantity ?? 0;
            return sum + (typeof litres === 'number' ? litres : parseFloat(litres) || 0);
        }, 0);
    }, [rows]);
    const averageCostPerLitre = useMemo(() => {
        if (totalLitres <= 0)
            return null;
        return totalAmount / totalLitres;
    }, [totalAmount, totalLitres]);
    const recordCount = rows.length;
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRows = rows.slice(startIndex, endIndex);
    useEffect(() => {
        setCurrentPage(1);
    }, [rows.length, itemsPerPage]);
    const formatDateRange = (start, end) => {
        if (!start || !end)
            return '';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const startDay = startDate.getDate();
        const startMonth = startDate.toLocaleDateString('en-GB', { month: 'short' });
        const startYear = startDate.getFullYear();
        const endDay = endDate.getDate();
        const endMonth = endDate.toLocaleDateString('en-GB', { month: 'short' });
        const endYear = endDate.getFullYear();
        if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
            return `${startDay} ${startMonth} ${startYear}`;
        }
        else if (startYear === endYear && startMonth === endMonth) {
            return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
        }
        else if (startYear === endYear) {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
        }
        else {
            return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        }
    };
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsx("section", { className: "app-hero overflow-hidden p-5 md:p-7", children: _jsxs("div", { className: "flex flex-col gap-5 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Fuel log" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Records" }), _jsxs("p", { className: "mt-2 max-w-2xl text-sm app-hero-muted", children: [recordCount, " records in view for ", formatDateRange(dateFrom, dateTo)] })] }), _jsxs(Button, { variant: "secondary", size: "md", onClick: () => setShowFiltersModal(true), className: "bg-white/10 text-white hover:bg-white/15 border-0 md:w-auto", children: [_jsx(Filter, { className: "h-4 w-4" }), _jsx("span", { children: "Filters" })] })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [_jsx(StatChip, { variant: "metric", label: "Range", className: "col-span-2 md:col-span-1", children: _jsxs("span", { className: "flex items-start gap-2 text-base md:text-xl", children: [_jsx(CalendarDays, { className: "mt-1 h-4 w-4 shrink-0 text-accent", "aria-hidden": true }), _jsx("span", { className: "leading-snug", children: formatDateRange(dateFrom, dateTo) })] }) }), _jsx(StatChip, { variant: "metric", label: "Spend", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(IndianRupee, { className: "h-4 w-4 text-accent", "aria-hidden": true }), moneyInteger.format(Math.round(totalAmount))] }) }), _jsx(StatChip, { variant: "metric", label: "Volume", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Fuel, { className: "h-4 w-4 text-accent", "aria-hidden": true }), Math.round(totalLitres), " L"] }) }), _jsx(StatChip, { variant: "metric", label: "Fill-ups", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Hash, { className: "h-4 w-4 text-accent", "aria-hidden": true }), recordCount] }) }), averageCostPerLitre != null && (_jsx(StatChip, { variant: "metric", label: "Avg cost / L", className: "col-span-2 md:col-span-4 lg:col-span-1", children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Gauge, { className: "h-4 w-4 text-accent", "aria-hidden": true }), money.format(averageCostPerLitre)] }) }))] }), _jsxs(Dialog, { open: showFiltersModal, onClose: () => setShowFiltersModal(false), title: "Filters", size: "lg", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Date Range" }), _jsx(DateRangePicker, { startDate: dateFrom, endDate: dateTo, onChange: (start, end) => {
                                            setDateFrom(start);
                                            setDateTo(end);
                                        } })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "filter-vehicle", children: "Vehicle" }), _jsxs(Select, { id: "filter-vehicle", value: selectedVehicle, onChange: (e) => setSelectedVehicle(e.target.value), children: [_jsx("option", { value: "", children: "All Vehicles" }), vehicles.map((v) => {
                                                const id = String(v.id ?? v._id ?? v.vehicleId ?? '');
                                                const name = v.name ?? v.vehicleName ?? 'Unknown';
                                                return _jsx("option", { value: id, children: name }, id);
                                            })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "filter-category", children: "Category" }), _jsxs(Select, { id: "filter-category", value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((c) => {
                                                const id = String(c.id ?? c._id ?? c.categoryId ?? '');
                                                const name = c.name ?? c.title ?? c.categoryName ?? 'Unknown';
                                                return _jsx("option", { value: id, children: name }, id);
                                            })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "filter-fuel", children: "Fuel Type" }), _jsxs(Select, { id: "filter-fuel", value: selectedFuelType, onChange: (e) => setSelectedFuelType(e.target.value), children: [_jsx("option", { value: "", children: "All Fuel Types" }), fuelTypes.map((type) => (_jsx("option", { value: type, children: toTitleCase(type) }, type)))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "filter-payment", children: "Payment Method" }), _jsxs(Select, { id: "filter-payment", value: selectedPaymentType, onChange: (e) => setSelectedPaymentType(e.target.value), children: [_jsx("option", { value: "", children: "All Payment Methods" }), paymentTypes.map((type) => (_jsx("option", { value: type, children: toTitleCase(type) }, type)))] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: handleResetFilters, children: "Reset" }), _jsx(Button, { type: "button", className: "flex-1", onClick: () => setShowFiltersModal(false), children: "Close" })] })] }), _jsxs(Card, { padding: false, className: "section-panel", children: [loading && _jsx(PageLoading, { label: "Loading\u2026" }), error && !loading && (_jsx("div", { className: "p-6", children: _jsx(Alert, { children: error }) })), !loading && !error && (_jsxs(_Fragment, { children: [isMobile ? (_jsx("div", { className: "divide-y divide-border", children: paginatedRows.length === 0 ? (_jsx(EmptyState, { icon: _jsx(ClipboardList, { className: "h-5 w-5" }), title: "No records", description: "Try adjusting filters or add a fuel record." })) : (paginatedRows.map((r, idx) => {
                                    const dateVal = r.date ?? r.createdAt ?? '';
                                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal);
                                    return (_jsxs("div", { className: "mobile-record entity-card mx-3 my-3 border-0 shadow-none hover:bg-muted/40 transition-colors md:mx-0", children: [_jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold text-foreground text-sm", children: isNaN(date.getTime()) ? '' : fmt.format(date) }), _jsx("div", { className: "mt-1 text-base font-semibold tracking-tight text-foreground", children: typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '') })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Badge, { tone: "accent", children: toTitleCase(r.fuelType ?? r.type ?? '') }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-10 w-10 text-accent", onClick: () => handleEdit(r), "aria-label": "Edit record", children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-10 w-10 text-danger", onClick: () => handleDelete(r), "aria-label": "Delete record", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsxs("dl", { className: "mobile-meta", children: [_jsx("dt", { children: "Vehicle" }), _jsx("dd", { children: r.vehicleName ?? r.vehicle ?? '' }), _jsx("dt", { children: "Category" }), _jsx("dd", { children: r.vehicleCategoryName ?? '' }), _jsx("dt", { children: "Volume" }), _jsxs("dd", { children: [r.litres ?? r.liters ?? r.volume ?? r.quantity ?? '', " L"] })] })] }, idx));
                                })) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "app-table", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-muted-foreground", children: [_jsx("th", { className: "py-3 pl-4 pr-4 font-medium", children: "Date" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Vehicle" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Category" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Fuel Type" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Volume (L)" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Price" }), _jsx("th", { className: "py-3 pr-4 font-medium", children: "Actions" })] }) }), _jsxs("tbody", { children: [paginatedRows.map((r, idx) => {
                                                    const dateVal = r.date ?? r.createdAt ?? '';
                                                    const date = typeof dateVal === 'number' || /\d+/.test(dateVal) ? new Date(Number(dateVal)) : new Date(dateVal);
                                                    return (_jsxs("tr", { children: [_jsx("td", { className: "py-3 pl-4 pr-4 whitespace-nowrap text-foreground", children: isNaN(date.getTime()) ? '' : fmt.format(date) }), _jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: r.vehicleName ?? r.vehicle ?? '' }), _jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: r.vehicleCategoryName ?? '' }), _jsx("td", { className: "py-3 pr-4", children: _jsx(Badge, { children: toTitleCase(r.fuelType ?? r.type ?? '') }) }), _jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: r.litres ?? r.liters ?? r.volume ?? r.quantity ?? '' }), _jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: typeof r.price === 'number' || typeof r.amount === 'number' ? money.format(Number(r.price ?? r.amount)) : (r.price ?? r.amount ?? '') }), _jsx("td", { className: "py-3 pr-4", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-accent", onClick: () => handleEdit(r), "aria-label": "Edit record", children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-danger", onClick: () => handleDelete(r), "aria-label": "Delete record", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, idx));
                                                }), paginatedRows.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 7, children: _jsx(EmptyState, { icon: _jsx(ClipboardList, { className: "h-5 w-5" }), title: "No records", description: "Try adjusting filters or add a fuel record." }) }) }))] })] }) })), rows.length > 0 && (_jsxs("div", { className: "px-4 py-3 border-t border-border bg-surface flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Show:" }), _jsxs(Select, { value: itemsPerPage, onChange: (e) => {
                                                    setItemsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }, className: "w-auto min-w-[4.5rem]", children: [_jsx("option", { value: "10", children: "10" }), _jsx("option", { value: "25", children: "25" }), _jsx("option", { value: "50", children: "50" }), _jsx("option", { value: "100", children: "100" })] }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["of ", rows.length, " records"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "secondary", size: "icon", className: "h-8 w-8", onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)), disabled: currentPage === 1, "aria-label": "Previous page", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Page" }), _jsx(Select, { value: currentPage, onChange: (e) => setCurrentPage(Number(e.target.value)), className: "w-auto min-w-[4rem]", children: Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (_jsx("option", { value: page, children: page }, page))) }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["of ", totalPages || 1] }), _jsx(Button, { variant: "secondary", size: "icon", className: "h-8 w-8", onClick: () => setCurrentPage(prev => Math.min(totalPages, prev + 1)), disabled: currentPage === totalPages || totalPages === 0, "aria-label": "Next page", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }))] }))] }), _jsxs(Dialog, { open: deleteConfirm.show, onClose: () => setDeleteConfirm({ show: false, record: null }), title: "Confirm Delete", size: "sm", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure you want to delete this fuel record? This action cannot be undone." }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: () => setDeleteConfirm({ show: false, record: null }), disabled: deleting, children: "Cancel" }), _jsx(Button, { type: "button", variant: "danger", className: "flex-1", onClick: confirmDelete, disabled: deleting, children: deleting ? 'Deleting...' : 'Delete' })] })] })] }));
}
