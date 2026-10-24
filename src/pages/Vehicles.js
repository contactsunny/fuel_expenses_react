import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Car, Hash } from 'lucide-react';
import { getUserVehicles, deleteVehicle } from '../services/vehicles';
import { getUserVehicleCategories } from '../services/vehicleCategories';
import VehicleForm from '../components/VehicleForm';
import { Card, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui';
export default function Vehicles() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, vehicle: null });
    const [deleting, setDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    useEffect(() => {
        const onResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getUserVehicles(),
            getUserVehicleCategories(),
        ])
            .then(([vehiclesRes, catsRes]) => {
            const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data);
            const vehicles = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : [];
            const catsPayload = (catsRes.data?.data ?? catsRes.data);
            const categories = Array.isArray(catsPayload) ? catsPayload : Array.isArray(catsPayload?.items) ? catsPayload.items : [];
            // Create category map
            const categoryIdToName = new Map();
            for (const c of categories) {
                const id = String(c.id ?? c._id ?? c.categoryId ?? '');
                const name = String(c.name ?? c.title ?? c.categoryName ?? 'Unknown');
                if (!id)
                    continue;
                categoryIdToName.set(id, name);
            }
            // Enrich vehicles with category names
            const enriched = vehicles.map((v) => {
                const categoryId = String(v.categoryId ?? v.vehicleCategoryId ?? v.category?.id ?? '');
                const categoryName = categoryId ? (categoryIdToName.get(categoryId) ?? '') : '';
                return { ...v, categoryName };
            });
            setRows(enriched);
        })
            .catch(() => setError('Failed to load vehicles'))
            .finally(() => setLoading(false));
    }, [refreshTrigger]);
    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowVehicleForm(true);
    };
    const handleDelete = (vehicle) => {
        setDeleteConfirm({ show: true, vehicle });
    };
    const confirmDelete = async () => {
        if (!deleteConfirm.vehicle)
            return;
        const vehicleId = deleteConfirm.vehicle.id ?? deleteConfirm.vehicle._id;
        if (!vehicleId) {
            setDeleteConfirm({ show: false, vehicle: null });
            return;
        }
        setDeleting(true);
        try {
            await deleteVehicle(String(vehicleId));
            setRefreshTrigger(prev => prev + 1);
            setDeleteConfirm({ show: false, vehicle: null });
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to delete vehicle');
        }
        finally {
            setDeleting(false);
        }
    };
    const handleFormSave = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    const isMobile = screenWidth < 768;
    const actionButtons = (r) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEdit(r), className: "h-8 w-8 text-accent", "aria-label": "Edit vehicle", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleDelete(r), className: "h-8 w-8 text-danger", "aria-label": "Delete vehicle", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }));
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsx("section", { className: "app-hero p-5 md:p-7", children: _jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Garage" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Vehicles" }), _jsxs("p", { className: "mt-2 text-sm app-hero-muted", children: [rows.length, " vehicles saved"] })] }), _jsxs(Button, { onClick: () => {
                                setEditingVehicle(null);
                                setShowVehicleForm(true);
                            }, className: "hidden md:inline-flex", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add vehicle"] })] }) }), _jsxs(Card, { padding: false, className: "section-panel", children: [loading && _jsx(PageLoading, {}), error && (_jsx("div", { className: "p-4", children: _jsx(Alert, { children: error }) })), !loading && !error && (_jsx(_Fragment, { children: rows.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Car, { className: "h-6 w-6" }), title: "No vehicles" })) : (_jsx("div", { className: isMobile ? "divide-y divide-border" : "grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3", children: rows.map((r, idx) => (_jsxs("div", { className: isMobile ? "mobile-record hover:bg-muted/50 transition-colors" : "entity-card p-4", children: [_jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent", children: _jsx(Car, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-3 truncate font-semibold text-foreground", children: r.name ?? r.vehicleName ?? 'Unnamed Vehicle' })] }), actionButtons(r)] }), _jsxs("dl", { className: isMobile ? "mobile-meta" : "mt-4 space-y-2 text-sm", children: [r.categoryName && (_jsxs(_Fragment, { children: [_jsx("dt", { className: isMobile ? "" : "text-muted-foreground", children: "Category" }), _jsx("dd", { className: isMobile ? "" : "text-foreground", children: r.categoryName })] })), r.vehicleNumber && (_jsxs(_Fragment, { children: [_jsxs("dt", { className: isMobile ? "" : "flex items-center gap-1 text-muted-foreground", children: [!isMobile && _jsx(Hash, { className: "h-3.5 w-3.5" }), "Registration"] }), _jsx("dd", { className: isMobile ? "" : "text-foreground", children: r.vehicleNumber })] }))] })] }, idx))) })) }))] }), _jsx("button", { onClick: () => {
                    setEditingVehicle(null);
                    setShowVehicleForm(true);
                }, className: "fixed z-40 w-14 h-14 bg-accent hover:brightness-105 text-accent-foreground rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-colors bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:hidden", "aria-label": "Add vehicle", children: _jsx(Plus, { className: "w-6 h-6" }) }), _jsx(VehicleForm, { isOpen: showVehicleForm, onClose: () => {
                    setShowVehicleForm(false);
                    setEditingVehicle(null);
                }, onSave: handleFormSave, vehicle: editingVehicle }), _jsxs(Dialog, { open: deleteConfirm.show, onClose: () => setDeleteConfirm({ show: false, vehicle: null }), title: "Confirm Delete", size: "sm", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure you want to delete this vehicle? This action cannot be undone." }), _jsxs(DialogFooter, { className: "border-t-0 pt-2 mt-4", children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: () => setDeleteConfirm({ show: false, vehicle: null }), disabled: deleting, children: "Cancel" }), _jsx(Button, { type: "button", variant: "danger", className: "flex-1", onClick: confirmDelete, disabled: deleting, children: deleting ? 'Deleting...' : 'Delete' })] })] })] }));
}
