import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createVehicle, updateVehicle } from '../services/vehicles';
import { getUserVehicleCategories } from '../services/vehicleCategories';
import { Button, Input, Select, Label, Alert, Dialog, DialogFooter } from './ui';
export default function VehicleForm({ isOpen, onClose, onSave, vehicle }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        vehicleNumber: ''
    });
    useEffect(() => {
        if (isOpen) {
            // Load categories when modal opens
            setLoading(true);
            getUserVehicleCategories()
                .then((res) => {
                const payload = (res.data?.data ?? res.data);
                const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
                setCategories(items);
            })
                .catch(() => setError('Failed to load categories'))
                .finally(() => setLoading(false));
            // If editing, populate form with vehicle data
            if (vehicle) {
                setFormData({
                    name: vehicle.name ?? vehicle.vehicleName ?? '',
                    categoryId: vehicle.categoryId ?? vehicle.vehicleCategoryId ?? vehicle.category?.id ?? '',
                    vehicleNumber: vehicle.vehicleNumber ?? ''
                });
            }
            else {
                // Reset form for create mode
                setFormData({
                    name: '',
                    categoryId: '',
                    vehicleNumber: ''
                });
            }
        }
    }, [isOpen, vehicle]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            // Validate required fields
            if (!formData.name || formData.name.trim() === '') {
                setError('Please enter a vehicle name');
                setSaving(false);
                return;
            }
            const payload = {
                name: String(formData.name).trim()
            };
            if (formData.categoryId) {
                payload.categoryId = String(formData.categoryId);
                payload.vehicleCategoryId = String(formData.categoryId);
            }
            if (formData.vehicleNumber && formData.vehicleNumber.trim() !== '') {
                payload.vehicleNumber = String(formData.vehicleNumber).trim();
            }
            const vehicleId = vehicle?.id ?? vehicle?._id;
            if (vehicleId) {
                // Update mode
                await updateVehicle(String(vehicleId), payload);
            }
            else {
                // Create mode
                await createVehicle(payload);
            }
            onSave();
            onClose();
        }
        catch (err) {
            console.error('Error saving vehicle:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save vehicle';
            setError(errorMessage);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, title: vehicle ? 'Edit Vehicle' : 'Add Vehicle', size: "sm", children: [error && _jsx(Alert, { className: "mb-4", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "grid gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "vehicle-name", children: "Vehicle Name *" }), _jsx(Input, { id: "vehicle-name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter vehicle name", required: true, autoComplete: "off", "data-lpignore": "true" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "vehicle-category", children: "Category" }), loading ? (_jsx("div", { className: "h-9 flex items-center text-sm text-muted-foreground", children: "Loading categories..." })) : (_jsxs(Select, { id: "vehicle-category", value: formData.categoryId, onChange: (e) => setFormData({ ...formData, categoryId: e.target.value }), children: [_jsx("option", { value: "", children: "Select a category" }), categories.map((cat) => {
                                        const id = String(cat.id ?? cat._id ?? cat.categoryId ?? '');
                                        const name = cat.name ?? cat.title ?? cat.categoryName ?? 'Unknown';
                                        return _jsx("option", { value: id, children: name }, id);
                                    })] }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "vehicle-number", children: "Registration Number" }), _jsx(Input, { id: "vehicle-number", type: "text", value: formData.vehicleNumber, onChange: (e) => setFormData({ ...formData, vehicleNumber: e.target.value }), placeholder: "Enter registration number", autoComplete: "off", "data-lpignore": "true" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", className: "flex-1", disabled: saving, children: saving ? 'Saving...' : 'Save' })] })] })] }));
}
