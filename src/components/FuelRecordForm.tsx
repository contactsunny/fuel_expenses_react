import { useState, useEffect } from 'react'
import { createFuel, updateFuel } from '../services/fuel'
import { getUserVehicles } from '../services/vehicles'
import { useTheme } from '../contexts/ThemeContext'
import { toTitleCase } from '../utils/formatters'

interface FuelRecordFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  record?: any // For edit mode
  defaultPreferences?: {
    defaultVehicleId?: string
    defaultFuelType?: string
    defaultPaymentType?: string
  }
}

export default function FuelRecordForm({ isOpen, onClose, onSave, record, defaultPreferences }: FuelRecordFormProps) {
  const { theme } = useTheme()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleId: '',
    amount: '',
    volume: '',
    fuelType: 'PETROL',
    paymentType: 'UPI'
  })

  useEffect(() => {
    if (isOpen) {
      // Load vehicles when modal opens
      setLoading(true)
      getUserVehicles()
        .then((res) => {
          const payload = (res.data?.data ?? res.data) as any
          const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
          setVehicles(items)
        })
        .catch(() => setError('Failed to load vehicles'))
        .finally(() => setLoading(false))

      // If editing, populate form with record data
      if (record) {
        setFormData({
          date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          vehicleId: record.vehicleId ?? record.vehicle?.id ?? '',
          amount: record.amount ?? record.cost ?? '',
          volume: record.volume ?? record.litres ?? record.liters ?? '',
          fuelType: record.fuelType ?? 'PETROL',
          paymentType: record.paymentType ?? 'UPI'
        })
      } else {
        // Reset form for create mode with default preferences
        setFormData({
          date: new Date().toISOString().split('T')[0],
          vehicleId: defaultPreferences?.defaultVehicleId ?? '',
          amount: '',
          volume: '',
          fuelType: defaultPreferences?.defaultFuelType ?? 'PETROL',
          paymentType: defaultPreferences?.defaultPaymentType ?? 'UPI'
        })
      }
    }
  }, [isOpen, record, defaultPreferences])

  const costPerLitre = formData.amount && formData.volume && parseFloat(formData.volume) > 0
    ? (parseFloat(formData.amount) / parseFloat(formData.volume)).toFixed(2)
    : '0.00'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.vehicleId) {
        setError('Please select a vehicle')
        setSaving(false)
        return
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Please enter a valid amount')
        setSaving(false)
        return
      }

      if (!formData.volume || parseFloat(formData.volume) <= 0) {
        setError('Please enter a valid volume')
        setSaving(false)
        return
      }

      const amount = parseFloat(formData.amount)
      const litres = parseFloat(formData.volume)
      const costPerLitre = litres > 0 ? (amount / litres).toFixed(2) : '0.00'
      
      // Format date as ISO string
      const date = new Date(formData.date)
      if (isNaN(date.getTime())) {
        setError('Please enter a valid date')
        setSaving(false)
        return
      }
      const dateISO = date.toISOString()

      const payload = {
        vehicleId: String(formData.vehicleId),
        amount: Number(amount),
        date: dateISO,
        costPerLitre: String(costPerLitre),
        paymentType: String(formData.paymentType),
        litres: Number(litres),
        fuelType: String(formData.fuelType)
      }

      const recordId = record?.id ?? record?._id
      if (recordId) {
        // Update mode
        await updateFuel(String(recordId), payload)
      } else {
        // Create mode
        await createFuel(payload)
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('Error saving fuel record:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save record'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold dark:text-slate-100 mb-4">
            {record ? 'Edit Fuel Record' : 'Add Fuel Record'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  colorScheme: theme === 'dark' ? 'dark' : 'light'
                }}
                required
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            {/* Vehicle Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vehicle
              </label>
              {loading ? (
                <div className="px-3 py-2 text-slate-500 dark:text-slate-400">Loading vehicles...</div>
              ) : (
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id ?? vehicle._id} value={vehicle.id ?? vehicle._id}>
                      {vehicle.name ?? vehicle.vehicleName ?? 'Unknown'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, amount: value })
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
                min="0"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            {/* Volume Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Volume (Litres)
              </label>
              <input
                type="number"
                step="any"
                value={formData.volume}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, volume: value })
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
                min="0"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            {/* Cost Per Litre (Calculated) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cost Per Litre (₹)
              </label>
              <input
                type="text"
                value={costPerLitre}
                disabled
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Fuel Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="PETROL">{toTitleCase('PETROL')}</option>
                <option value="DIESEL">{toTitleCase('DIESEL')}</option>
                <option value="CNG">{toTitleCase('CNG')}</option>
                <option value="EV">{toTitleCase('EV')}</option>
              </select>
            </div>

            {/* Payment Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Payment Type
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="UPI">{toTitleCase('UPI')}</option>
                <option value="CASH">{toTitleCase('CASH')}</option>
                <option value="CREDIT_CARD">{toTitleCase('CREDIT_CARD')}</option>
                <option value="DEBIT_CARD">{toTitleCase('DEBIT_CARD')}</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

