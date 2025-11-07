import { Route, Routes, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Vehicles from './pages/Vehicles'
import Categories from './pages/Categories'
import ServiceRecords from './pages/ServiceRecords'
import Analytics from './pages/Analytics/Analytics'
import AnalyticsVehicleCategory from './pages/Analytics/AnalyticsVehicleCategory'
import AnalyticsFuelPrice from './pages/Analytics/AnalyticsFuelPrice'
import AnalyticsFuelType from './pages/Analytics/AnalyticsFuelType'
import { FuelRecordProvider } from './contexts/FuelRecordContext'

function RequireAuth({ children }: { children: ReactElement }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/live"
        element={
          <RequireAuth>
            <FuelRecordProvider>
              <Layout />
            </FuelRecordProvider>
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="records" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="categories" element={<Categories />} />
        <Route path="serviceRecords" element={<ServiceRecords />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="analytics/vehicleCategory" element={<AnalyticsVehicleCategory />} />
        <Route path="analytics/fuelPrice" element={<AnalyticsFuelPrice />} />
        <Route path="analytics/vsChart" element={<AnalyticsFuelType />} />
      </Route>
    </Routes>
  )
}
