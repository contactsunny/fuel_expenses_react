import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getUserVehicles } from '../services/vehicles';
import { savePreferences, getPreferences } from '../services/preferences';
import { toTitleCase } from '../utils/formatters';
import { Card, Select, Label, Alert, PageLoading } from '../components/ui';
export default function Settings() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [defaultVehicleId, setDefaultVehicleId] = useState('');
    const [defaultFuelType, setDefaultFuelType] = useState('');
    const [defaultPaymentType, setDefaultPaymentType] = useState('');
    const fuelTypes = ['PETROL', 'DIESEL', 'CNG', 'EV'];
    const paymentTypes = ['UPI', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'];
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getUserVehicles(),
            getPreferences()
        ])
            .then(([vehiclesRes, preferencesRes]) => {
            const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data);
            const vehiclesList = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : [];
            setVehicles(vehiclesList);
            const preferences = preferencesRes.data?.data ?? preferencesRes.data ?? {};
            setDefaultVehicleId(preferences.defaultVehicleId ?? '');
            setDefaultFuelType(preferences.defaultFuelType ?? '');
            setDefaultPaymentType(preferences.defaultPaymentType ?? '');
        })
            .catch(() => setError('Failed to load settings'))
            .finally(() => setLoading(false));
    }, []);
    const handlePreferenceChange = async (field, value) => {
        const oldVehicleId = defaultVehicleId;
        const oldFuelType = defaultFuelType;
        const oldPaymentType = defaultPaymentType;
        if (field === 'vehicle') {
            setDefaultVehicleId(value);
        }
        else if (field === 'fuelType') {
            setDefaultFuelType(value);
        }
        else if (field === 'paymentType') {
            setDefaultPaymentType(value);
        }
        const updatedVehicleId = field === 'vehicle' ? value : defaultVehicleId;
        const updatedFuelType = field === 'fuelType' ? value : defaultFuelType;
        const updatedPaymentType = field === 'paymentType' ? value : defaultPaymentType;
        setSaving(true);
        setError(null);
        try {
            await savePreferences({
                defaultVehicleId: updatedVehicleId || undefined,
                defaultFuelType: updatedFuelType || undefined,
                defaultPaymentType: updatedPaymentType || undefined
            });
        }
        catch (err) {
            console.error('Error saving preferences:', err);
            setError(err.response?.data?.message || 'Failed to save preferences');
            if (field === 'vehicle') {
                setDefaultVehicleId(oldVehicleId);
            }
            else if (field === 'fuelType') {
                setDefaultFuelType(oldFuelType);
            }
            else if (field === 'paymentType') {
                setDefaultPaymentType(oldPaymentType);
            }
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "app-page max-w-3xl space-y-5", children: [_jsxs("section", { className: "app-hero p-5 md:p-7", children: [_jsx("p", { className: "app-eyebrow app-hero-muted", children: "Preferences" }), _jsx("h1", { className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl", children: "Settings" }), _jsx("p", { className: "mt-2 text-sm app-hero-muted", children: "Defaults applied when adding a new fuel record." })] }), _jsxs(Card, { className: "section-panel p-5 md:p-6", children: [_jsx("h2", { className: "text-base font-semibold text-foreground mb-1", children: "Defaults" }), _jsx("p", { className: "mb-5 text-sm text-muted-foreground", children: "These choices prefill new fuel records." }), loading && _jsx(PageLoading, { label: "Loading settings..." }), error && _jsx(Alert, { className: "mb-4", children: error }), !loading && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "settings-vehicle", children: "Vehicle" }), _jsxs(Select, { id: "settings-vehicle", value: defaultVehicleId, onChange: (e) => handlePreferenceChange('vehicle', e.target.value), disabled: saving, children: [_jsx("option", { value: "", children: "Select a vehicle" }), vehicles.map((v) => {
                                                const id = String(v.id ?? v._id ?? v.vehicleId ?? '');
                                                const name = v.name ?? v.vehicleName ?? 'Unknown';
                                                return _jsx("option", { value: id, children: name }, id);
                                            })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "settings-fuel", children: "Fuel Type" }), _jsxs(Select, { id: "settings-fuel", value: defaultFuelType, onChange: (e) => handlePreferenceChange('fuelType', e.target.value), disabled: saving, children: [_jsx("option", { value: "", children: "Select fuel type" }), fuelTypes.map((type) => (_jsx("option", { value: type, children: toTitleCase(type) }, type)))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "settings-payment", children: "Payment Method" }), _jsxs(Select, { id: "settings-payment", value: defaultPaymentType, onChange: (e) => handlePreferenceChange('paymentType', e.target.value), disabled: saving, children: [_jsx("option", { value: "", children: "Select payment method" }), paymentTypes.map((type) => (_jsx("option", { value: type, children: toTitleCase(type) }, type)))] })] }), saving && (_jsx("p", { className: "text-sm text-muted-foreground", role: "status", children: "Saving preferences..." }))] }))] })] }));
}
