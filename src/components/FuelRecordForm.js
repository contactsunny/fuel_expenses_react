import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createFuel, updateFuel } from '../services/fuel';
import { getUserVehicles } from '../services/vehicles';
import { useTheme } from '../contexts/ThemeContext';
import { toTitleCase } from '../utils/formatters';
import { Button, Input, Select, Label, Alert, Dialog, DialogFooter } from './ui';
export default function FuelRecordForm({ isOpen, onClose, onSave, record, defaultPreferences }) {
    const { resolvedTheme } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        vehicleId: '',
        amount: '',
        volume: '',
        fuelType: 'PETROL',
        paymentType: 'UPI'
    });
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setLoading(true);
            getUserVehicles()
                .then((res) => {
                const payload = (res.data?.data ?? res.data);
                const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
                setVehicles(items);
            })
                .catch(() => setError('Failed to load vehicles'))
                .finally(() => setLoading(false));
            if (record) {
                setFormData({
                    date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    vehicleId: record.vehicleId ?? record.vehicle?.id ?? '',
                    amount: record.amount ?? record.cost ?? '',
                    volume: record.volume ?? record.litres ?? record.liters ?? '',
                    fuelType: record.fuelType ?? 'PETROL',
                    paymentType: record.paymentType ?? 'UPI'
                });
            }
            else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    vehicleId: defaultPreferences?.defaultVehicleId ?? '',
                    amount: '',
                    volume: '',
                    fuelType: defaultPreferences?.defaultFuelType ?? 'PETROL',
                    paymentType: defaultPreferences?.defaultPaymentType ?? 'UPI'
                });
            }
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, record, defaultPreferences]);
    const costPerLitre = formData.amount && formData.volume && parseFloat(formData.volume) > 0
        ? (parseFloat(formData.amount) / parseFloat(formData.volume)).toFixed(2)
        : '0.00';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            if (!formData.vehicleId) {
                setError('Please select a vehicle');
                setSaving(false);
                return;
            }
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setError('Please enter a valid amount');
                setSaving(false);
                return;
            }
            if (!formData.volume || parseFloat(formData.volume) <= 0) {
                setError('Please enter a valid volume');
                setSaving(false);
                return;
            }
            const amount = parseFloat(formData.amount);
            const litres = parseFloat(formData.volume);
            const costPerLitre = litres > 0 ? (amount / litres).toFixed(2) : '0.00';
            const date = new Date(formData.date);
            if (isNaN(date.getTime())) {
                setError('Please enter a valid date');
                setSaving(false);
                return;
            }
            const dateISO = date.toISOString();
            const payload = {
                vehicleId: String(formData.vehicleId),
                amount: Number(amount),
                date: dateISO,
                costPerLitre: String(costPerLitre),
                paymentType: String(formData.paymentType),
                litres: Number(litres),
                fuelType: String(formData.fuelType)
            };
            const recordId = record?.id ?? record?._id;
            if (recordId) {
                await updateFuel(String(recordId), payload);
            }
            else {
                await createFuel(payload);
            }
            onSave();
            onClose();
        }
        catch (err) {
            console.error('Error saving fuel record:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save record';
            setError(errorMessage);
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, title: record ? 'Edit Fuel Record' : 'Add Fuel Record', size: "md", children: [error && _jsx(Alert, { className: "mb-4", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "fuel-date", children: "Date" }), _jsx(Input, { id: "fuel-date", type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), style: { colorScheme: resolvedTheme }, required: true, autoComplete: "off", "data-lpignore": "true", "data-form-type": "other" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "fuel-vehicle", children: "Vehicle" }), loading ? (_jsx("div", { className: "h-9 flex items-center text-sm text-muted-foreground", children: "Loading vehicles..." })) : (_jsxs(Select, { id: "fuel-vehicle", value: formData.vehicleId, onChange: (e) => setFormData({ ...formData, vehicleId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select a vehicle" }), vehicles.map((vehicle) => (_jsx("option", { value: vehicle.id ?? vehicle._id, children: vehicle.name ?? vehicle.vehicleName ?? 'Unknown' }, vehicle.id ?? vehicle._id)))] }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "fuel-amount", children: "Amount (\u20B9)" }), _jsx(Input, { id: "fuel-amount", type: "number", step: "any", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), placeholder: "0.00", required: true, min: "0", autoComplete: "off", "data-lpignore": "true", "data-form-type": "other" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "fuel-volume", children: "Volume (Litres)" }), _jsx(Input, { id: "fuel-volume", type: "number", step: "any", value: formData.volume, onChange: (e) => setFormData({ ...formData, volume: e.target.value }), placeholder: "0.00", required: true, min: "0", autoComplete: "off", "data-lpignore": "true", "data-form-type": "other" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "fuel-cpl", children: "Cost Per Litre (\u20B9)" }), _jsx(Input, { id: "fuel-cpl", type: "text", value: costPerLitre, disabled: true, className: "bg-muted text-muted-foreground" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "fuel-type", children: "Fuel Type" }), _jsxs(Select, { id: "fuel-type", value: formData.fuelType, onChange: (e) => setFormData({ ...formData, fuelType: e.target.value }), required: true, children: [_jsx("option", { value: "PETROL", children: toTitleCase('PETROL') }), _jsx("option", { value: "DIESEL", children: toTitleCase('DIESEL') }), _jsx("option", { value: "CNG", children: toTitleCase('CNG') }), _jsx("option", { value: "EV", children: toTitleCase('EV') })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "fuel-payment", children: "Payment Type" }), _jsxs(Select, { id: "fuel-payment", value: formData.paymentType, onChange: (e) => setFormData({ ...formData, paymentType: e.target.value }), required: true, children: [_jsx("option", { value: "UPI", children: toTitleCase('UPI') }), _jsx("option", { value: "CASH", children: toTitleCase('CASH') }), _jsx("option", { value: "CREDIT_CARD", children: toTitleCase('CREDIT_CARD') }), _jsx("option", { value: "DEBIT_CARD", children: toTitleCase('DEBIT_CARD') })] })] }), _jsxs(DialogFooter, { className: "md:col-span-2", children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: onClose, children: "Cancel" }), _jsx(Button, { type: "submit", className: "flex-1", disabled: saving, children: saving ? 'Saving...' : 'Save' })] })] })] }));
}
