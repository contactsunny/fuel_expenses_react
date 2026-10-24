import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Vehicles from './pages/Vehicles';
import Categories from './pages/Categories';
import ServiceRecords from './pages/ServiceRecords';
import Analytics from './pages/Analytics/Analytics';
import AnalyticsVehicleCategory from './pages/Analytics/AnalyticsVehicleCategory';
import AnalyticsFuelPrice from './pages/Analytics/AnalyticsFuelPrice';
import AnalyticsFuelType from './pages/Analytics/AnalyticsFuelType';
import { FuelRecordProvider } from './contexts/FuelRecordContext';
import InstallPrompt from './components/InstallPrompt';
function RequireAuth({ children }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token)
        return _jsx(Navigate, { to: "/", replace: true });
    return children;
}
export default function App() {
    return (_jsxs(_Fragment, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsxs(Route, { path: "/live", element: _jsx(RequireAuth, { children: _jsx(FuelRecordProvider, { children: _jsx(Layout, {}) }) }), children: [_jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "records", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "vehicles", element: _jsx(Vehicles, {}) }), _jsx(Route, { path: "categories", element: _jsx(Categories, {}) }), _jsx(Route, { path: "serviceRecords", element: _jsx(ServiceRecords, {}) }), _jsx(Route, { path: "analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "analytics/vehicleCategory", element: _jsx(AnalyticsVehicleCategory, {}) }), _jsx(Route, { path: "analytics/fuelPrice", element: _jsx(AnalyticsFuelPrice, {}) }), _jsx(Route, { path: "analytics/vsChart", element: _jsx(AnalyticsFuelType, {}) })] })] }), _jsx(InstallPrompt, {})] }));
}
