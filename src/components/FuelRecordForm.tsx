import { useState, useEffect } from 'react'
import { createFuel, updateFuel } from '../services/fuel'
import { getUserVehicles } from '../services/vehicles'
import { useTheme } from '../contexts/ThemeContext'
import { toTitleCase } from '../utils/formatters'
import { Button, Input, Select, Label, Alert, Dialog, DialogFooter } from './ui'

interface FuelRecordFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  record?: any
  defaultPreferences?: {
    defaultVehicleId?: string
    defaultFuelType?: string
    defaultPaymentType?: string
  }
}

export default function FuelRecordForm({ isOpen, onClose, onSave, record, defaultPreferences }: FuelRecordFormProps) {
  const { resolvedTheme } = useTheme()
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
      document.body.style.overflow = 'hidden'

      setLoading(true)
      getUserVehicles()
        .then((res) => {
          const payload = (res.data?.data ?? res.data) as any
          const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
          setVehicles(items)
        })
        .catch(() => setError('Failed to load vehicles'))
        .finally(() => setLoading(false))

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
        setFormData({
          date: new Date().toISOString().split('T')[0],
          vehicleId: defaultPreferences?.defaultVehicleId ?? '',
          amount: '',
          volume: '',
          fuelType: defaultPreferences?.defaultFuelType ?? 'PETROL',
          paymentType: defaultPreferences?.defaultPaymentType ?? 'UPI'
        })
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
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
        await updateFuel(String(recordId), payload)
      } else {
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

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={record ? 'Edit Fuel Record' : 'Add Fuel Record'}
      size="sm"
    >
      {error && <Alert className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="fuel-date">Date</Label>
          <Input
            id="fuel-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ colorScheme: resolvedTheme }}
            required
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="fuel-vehicle">Vehicle</Label>
          {loading ? (
            <div className="h-9 flex items-center text-sm text-muted-foreground">Loading vehicles...</div>
          ) : (
            <Select
              id="fuel-vehicle"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id ?? vehicle._id} value={vehicle.id ?? vehicle._id}>
                  {vehicle.name ?? vehicle.vehicleName ?? 'Unknown'}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <Label htmlFor="fuel-amount">Amount (₹)</Label>
          <Input
            id="fuel-amount"
            type="number"
            step="any"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
            min="0"
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>

        <div>
          <Label htmlFor="fuel-volume">Volume (Litres)</Label>
          <Input
            id="fuel-volume"
            type="number"
            step="any"
            value={formData.volume}
            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            placeholder="0.00"
            required
            min="0"
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
          />
        </div>

        <div>
          <Label htmlFor="fuel-cpl">Cost Per Litre (₹)</Label>
          <Input id="fuel-cpl" type="text" value={costPerLitre} disabled className="bg-muted text-muted-foreground" />
        </div>

        <div>
          <Label htmlFor="fuel-type">Fuel Type</Label>
          <Select
            id="fuel-type"
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
            required
          >
            <option value="PETROL">{toTitleCase('PETROL')}</option>
            <option value="DIESEL">{toTitleCase('DIESEL')}</option>
            <option value="CNG">{toTitleCase('CNG')}</option>
            <option value="EV">{toTitleCase('EV')}</option>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="fuel-payment">Payment Type</Label>
          <Select
            id="fuel-payment"
            value={formData.paymentType}
            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            required
          >
            <option value="UPI">{toTitleCase('UPI')}</option>
            <option value="CASH">{toTitleCase('CASH')}</option>
            <option value="CREDIT_CARD">{toTitleCase('CREDIT_CARD')}</option>
            <option value="DEBIT_CARD">{toTitleCase('DEBIT_CARD')}</option>
          </Select>
        </div>

        <DialogFooter className="md:col-span-2">
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
