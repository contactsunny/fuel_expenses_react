import { useState, useEffect } from 'react'
import { createVehicle, updateVehicle } from '../services/vehicles'
import { getUserVehicleCategories } from '../services/vehicleCategories'
import { Button, Input, Select, Label, Alert, Dialog, DialogFooter } from './ui'

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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
      size="sm"
    >
      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="vehicle-name">Vehicle Name *</Label>
          <Input
            id="vehicle-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter vehicle name"
            required
            autoComplete="off"
            data-lpignore="true"
          />
        </div>

        <div>
          <Label htmlFor="vehicle-category">Category</Label>
          {loading ? (
            <div className="h-9 flex items-center text-sm text-muted-foreground">Loading categories...</div>
          ) : (
            <Select
              id="vehicle-category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => {
                const id = String(cat.id ?? cat._id ?? cat.categoryId ?? '')
                const name = cat.name ?? cat.title ?? cat.categoryName ?? 'Unknown'
                return <option key={id} value={id}>{name}</option>
              })}
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="vehicle-number">Registration Number</Label>
          <Input
            id="vehicle-number"
            type="text"
            value={formData.vehicleNumber}
            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
            placeholder="Enter registration number"
            autoComplete="off"
            data-lpignore="true"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
