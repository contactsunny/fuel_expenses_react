import { useEffect, useState } from 'react'
import { getUserVehicles } from '../services/vehicles'
import { savePreferences, getPreferences } from '../services/preferences'
import { toTitleCase } from '../utils/formatters'

export default function Settings() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [defaultVehicleId, setDefaultVehicleId] = useState<string>('')
  const [defaultFuelType, setDefaultFuelType] = useState<string>('')
  const [defaultPaymentType, setDefaultPaymentType] = useState<string>('')

  const fuelTypes = ['PETROL', 'DIESEL', 'CNG', 'EV']
  const paymentTypes = ['UPI', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD']

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getUserVehicles(),
      getPreferences()
    ])
      .then(([vehiclesRes, preferencesRes]: any) => {
        // Load vehicles
        const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data) as any
        const vehiclesList: any[] = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : []
        setVehicles(vehiclesList)

        // Load preferences and set selected values
        const preferences = preferencesRes.data?.data ?? preferencesRes.data ?? {}
        setDefaultVehicleId(preferences.defaultVehicleId ?? '')
        setDefaultFuelType(preferences.defaultFuelType ?? '')
        setDefaultPaymentType(preferences.defaultPaymentType ?? '')
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handlePreferenceChange = async (field: 'vehicle' | 'fuelType' | 'paymentType', value: string) => {
    // Store old values for potential revert
    const oldVehicleId = defaultVehicleId
    const oldFuelType = defaultFuelType
    const oldPaymentType = defaultPaymentType

    // Update state immediately for better UX
    if (field === 'vehicle') {
      setDefaultVehicleId(value)
    } else if (field === 'fuelType') {
      setDefaultFuelType(value)
    } else if (field === 'paymentType') {
      setDefaultPaymentType(value)
    }

    // Prepare payload with updated values
    const updatedVehicleId = field === 'vehicle' ? value : defaultVehicleId
    const updatedFuelType = field === 'fuelType' ? value : defaultFuelType
    const updatedPaymentType = field === 'paymentType' ? value : defaultPaymentType

    setSaving(true)
    setError(null)
    try {
      await savePreferences({
        defaultVehicleId: updatedVehicleId || undefined,
        defaultFuelType: updatedFuelType || undefined,
        defaultPaymentType: updatedPaymentType || undefined
      })
    } catch (err: any) {
      console.error('Error saving preferences:', err)
      setError(err.response?.data?.message || 'Failed to save preferences')
      // Revert the change on error
      if (field === 'vehicle') {
        setDefaultVehicleId(oldVehicleId)
      } else if (field === 'fuelType') {
        setDefaultFuelType(oldFuelType)
      } else if (field === 'paymentType') {
        setDefaultPaymentType(oldPaymentType)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold dark:text-slate-100">Settings</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="text-md font-semibold text-slate-900 dark:text-slate-100 mb-4">Defaults</h3>

        {loading && <div className="text-center text-slate-500 dark:text-slate-400 py-4">Loading settings...</div>}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {/* Vehicle Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Vehicle
              </label>
              <select
                value={defaultVehicleId}
                onChange={(e) => handlePreferenceChange('vehicle', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => {
                  const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
                  const name = v.name ?? v.vehicleName ?? 'Unknown'
                  return <option key={id} value={id}>{name}</option>
                })}
              </select>
            </div>

            {/* Fuel Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Fuel Type
              </label>
              <select
                value={defaultFuelType}
                onChange={(e) => handlePreferenceChange('fuelType', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select fuel type</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>{toTitleCase(type)}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Method
              </label>
              <select
                value={defaultPaymentType}
                onChange={(e) => handlePreferenceChange('paymentType', e.target.value)}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select payment method</option>
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>{toTitleCase(type)}</option>
                ))}
              </select>
            </div>

            {saving && (
              <div className="text-sm text-slate-500 dark:text-slate-400">Saving preferences...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

