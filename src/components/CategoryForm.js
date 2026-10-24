import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createVehicleCategory, updateVehicleCategory } from '../services/vehicleCategories';
import { Button, Input, Textarea, Label, Alert, Dialog, DialogFooter } from './ui';
export default function CategoryForm({ isOpen, onClose, onSave, category }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    useEffect(() => {
        if (isOpen) {
            // If editing, populate form with category data
            if (category) {
                setFormData({
                    name: category.name ?? category.title ?? category.categoryName ?? '',
                    description: category.description ?? ''
                });
            }
            else {
                // Reset form for create mode
                setFormData({
                    name: '',
                    description: ''
                });
            }
        }
    }, [isOpen, category]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            // Validate required fields
            if (!formData.name || formData.name.trim() === '') {
                setError('Please enter a category name');
                setSaving(false);
                return;
            }
            const payload = {
                name: String(formData.name).trim()
            };
            if (formData.description && formData.description.trim() !== '') {
                payload.description = String(formData.description).trim();
            }
            const categoryId = category?.id ?? category?._id;
            if (categoryId) {
                // Update mode
                await updateVehicleCategory(String(categoryId), payload);
            }
            else {
                // Create mode
                await createVehicleCategory(payload);
            }
            onSave();
            onClose();
        }
        catch (err) {
            console.error('Error saving category:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save category';
            setError(errorMessage);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, title: category ? 'Edit Category' : 'Add Category', size: "sm", children: [error && _jsx(Alert, { className: "mb-4", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "category-name", children: "Category Name *" }), _jsx(Input, { id: "category-name", type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter category name", required: true, autoComplete: "off", "data-lpignore": "true" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category-description", children: "Description" }), _jsx(Textarea, { id: "category-description", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Enter description", rows: 3, autoComplete: "off", "data-lpignore": "true" })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", className: "flex-1", disabled: saving, children: saving ? 'Saving...' : 'Save' })] })] })] }));
}
