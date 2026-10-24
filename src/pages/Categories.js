import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Tags, FileText } from 'lucide-react';
import { getUserVehicleCategories, deleteVehicleCategory } from '../services/vehicleCategories';
import CategoryForm from '../components/CategoryForm';
import { Card, PageLoading, EmptyState, Alert, Dialog, DialogFooter, Button } from '../components/ui';
export default function Categories() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, category: null });
    const [deleting, setDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    useEffect(() => {
        const onResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        setLoading(true);
        getUserVehicleCategories()
            .then((res) => {
            const payload = (res.data?.data ?? res.data);
            const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
            setRows(items);
        })
            .catch(() => setError('Failed to load categories'))
            .finally(() => setLoading(false));
    }, [refreshTrigger]);
    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowCategoryForm(true);
    };
    const handleDelete = (category) => {
        setDeleteConfirm({ show: true, category });
    };
    const confirmDelete = async () => {
        if (!deleteConfirm.category)
            return;
        const categoryId = deleteConfirm.category.id ?? deleteConfirm.category._id;
        if (!categoryId) {
            setDeleteConfirm({ show: false, category: null });
            return;
        }
        setDeleting(true);
        try {
            await deleteVehicleCategory(String(categoryId));
            setRefreshTrigger(prev => prev + 1);
            setDeleteConfirm({ show: false, category: null });
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category');
        }
        finally {
            setDeleting(false);
        }
    };
    const handleFormSave = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    // Dynamically determine columns from the first row
    const columns = useMemo(() => {
        if (rows.length === 0)
            return [];
        const firstRow = rows[0];
        const cols = [];
        // Check for common category fields
        if (firstRow.name !== undefined || firstRow.title !== undefined || firstRow.categoryName !== undefined) {
            cols.push({ key: 'name', label: 'Name' });
        }
        if (firstRow.description !== undefined) {
            cols.push({ key: 'description', label: 'Description' });
        }
        // If no standard fields found, show all non-empty fields from first row
        if (cols.length === 0) {
            Object.keys(firstRow).forEach(key => {
                if (firstRow[key] !== null && firstRow[key] !== undefined && firstRow[key] !== '') {
                    cols.push({ key, label: key.charAt(0).toUpperCase() + key.slice(1) });
                }
            });
        }
        return cols;
    }, [rows]);
    const getValue = (row, col) => {
        switch (col.key) {
            case 'name':
                return row.name ?? row.title ?? row.categoryName ?? '';
            default:
                return row[col.key] ?? '';
        }
    };
    const isMobile = screenWidth < 768;
    const actionButtons = (r) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEdit(r), className: "h-8 w-8 text-accent", "aria-label": "Edit category", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleDelete(r), className: "h-8 w-8 text-danger", "aria-label": "Delete category", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }));
    return (_jsxs("div", { className: "app-page space-y-5", children: [_jsx("section", { className: "app-hero p-5 md:p-7", children: _jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Organization" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Categories" }), _jsxs("p", { className: "mt-2 text-sm app-hero-muted", children: [rows.length, " categories available"] })] }), _jsxs(Button, { onClick: () => {
                                setEditingCategory(null);
                                setShowCategoryForm(true);
                            }, className: "hidden md:inline-flex", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add category"] })] }) }), _jsxs(Card, { padding: false, className: "section-panel", children: [loading && _jsx(PageLoading, {}), error && (_jsx("div", { className: "p-4", children: _jsx(Alert, { children: error }) })), !loading && !error && (_jsx(_Fragment, { children: rows.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Tags, { className: "h-6 w-6" }), title: "No categories" })) : (_jsx("div", { className: isMobile ? "divide-y divide-border" : "grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3", children: rows.map((r, idx) => (_jsxs("div", { className: isMobile ? "mobile-record hover:bg-muted/50 transition-colors" : "entity-card p-4", children: [_jsxs("div", { className: "flex justify-between items-start gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent", children: _jsx(Tags, { className: "h-5 w-5" }) }), _jsx("div", { className: "mt-3 truncate font-semibold text-foreground", children: r.name ?? r.title ?? r.categoryName ?? 'Unnamed Category' })] }), actionButtons(r)] }), _jsx("dl", { className: isMobile ? "mobile-meta" : "mt-4 space-y-2 text-sm", children: columns.filter(c => c.key !== 'name').map(col => {
                                            const val = getValue(r, col);
                                            return val ? (_jsxs("div", { className: isMobile ? "contents" : "", children: [_jsxs("dt", { className: isMobile ? "" : "flex items-center gap-1 text-muted-foreground", children: [!isMobile && _jsx(FileText, { className: "h-3.5 w-3.5" }), col.label] }), _jsx("dd", { className: isMobile ? "" : "text-foreground", children: val })] }, col.key)) : null;
                                        }) })] }, idx))) })) }))] }), _jsx("button", { onClick: () => {
                    setEditingCategory(null);
                    setShowCategoryForm(true);
                }, className: "fixed z-40 w-14 h-14 bg-accent hover:brightness-105 text-accent-foreground rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-colors bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] md:hidden", "aria-label": "Add category", children: _jsx(Plus, { className: "w-6 h-6" }) }), _jsx(CategoryForm, { isOpen: showCategoryForm, onClose: () => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                }, onSave: handleFormSave, category: editingCategory }), _jsxs(Dialog, { open: deleteConfirm.show, onClose: () => setDeleteConfirm({ show: false, category: null }), title: "Confirm Delete", size: "sm", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Are you sure you want to delete this category? This action cannot be undone." }), _jsxs(DialogFooter, { className: "border-t-0 pt-2 mt-4", children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: () => setDeleteConfirm({ show: false, category: null }), disabled: deleting, children: "Cancel" }), _jsx(Button, { type: "button", variant: "danger", className: "flex-1", onClick: confirmDelete, disabled: deleting, children: deleting ? 'Deleting...' : 'Delete' })] })] })] }));
}
