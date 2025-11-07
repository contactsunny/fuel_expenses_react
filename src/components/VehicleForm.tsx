import { useState, useEffect } from 'react'
import { createVehicle, updateVehicle } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'

interface VehicleFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  vehicle?: any // For edit mode
}

export default function VehicleForm({ isOpen, onClose, onSave, vehicle }: VehicleFormProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    vehicleNumber: ''
  })

  useEffect(() => {
    if (isOpen) {
      // Load categories when modal opens
      setLoading(true)
      getUserVehicleCategories()
        .then((res) => {
          const payload = (res.data?.data ?? res.data) as any
          const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
          setCategories(items)
        })
        .catch(() => setError('Failed to load categories'))
        .finally(() => setLoading(false))

      // If editing, populate form with vehicle data
      if (vehicle) {
        setFormData({
          name: vehicle.name ?? vehicle.vehicleName ?? '',
          categoryId: vehicle.categoryId ?? vehicle.vehicleCategoryId ?? vehicle.category?.id ?? '',
          vehicleNumber: vehicle.vehicleNumber ?? ''
        })
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          categoryId: '',
          vehicleNumber: ''
        })
      }
    }
  }, [isOpen, vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name || formData.name.trim() === '') {
        setError('Please enter a vehicle name')
        setSaving(false)
        return
      }

      const payload: any = {
        name: String(formData.name).trim()
      }

      if (formData.categoryId) {
        payload.categoryId = String(formData.categoryId)
        payload.vehicleCategoryId = String(formData.categoryId)
      }

      if (formData.vehicleNumber && formData.vehicleNumber.trim() !== '') {
        payload.vehicleNumber = String(formData.vehicleNumber).trim()
      }

      const vehicleId = vehicle?.id ?? vehicle?._id
      if (vehicleId) {
        // Update mode
        await updateVehicle(String(vehicleId), payload)
      } else {
        // Create mode
        await createVehicle(payload)
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('Error saving vehicle:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save vehicle'
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
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter vehicle name"
                required
                autoComplete="off"
                data-lpignore="true"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              {loading ? (
                <div className="px-3 py-2 text-slate-500 dark:text-slate-400">Loading categories...</div>
              ) : (
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => {
                    const id = String(cat.id ?? cat._id ?? cat.categoryId ?? '')
                    const name = cat.name ?? cat.title ?? cat.categoryName ?? 'Unknown'
                    return <option key={id} value={id}>{name}</option>
                  })}
                </select>
              )}
            </div>

            {/* Registration Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter registration number"
                autoComplete="off"
                data-lpignore="true"
              />
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

