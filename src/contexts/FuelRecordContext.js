import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const FuelRecordContext = createContext(undefined);
export function FuelRecordProvider({ children }) {
    const [editingRecord, setEditingRecord] = useState(null);
    const [showFuelForm, setShowFuelForm] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const triggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    return (_jsx(FuelRecordContext.Provider, { value: {
            editingRecord,
            setEditingRecord,
            showFuelForm,
            setShowFuelForm,
            refreshTrigger,
            triggerRefresh,
        }, children: children }));
}
export function useFuelRecord() {
    const context = useContext(FuelRecordContext);
    if (context === undefined) {
        throw new Error('useFuelRecord must be used within a FuelRecordProvider');
    }
    return context;
}
