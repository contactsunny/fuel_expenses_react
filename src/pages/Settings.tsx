import { useEffect, useState } from 'react'
import { getUserVehicles } from '../services/vehicles'
import { savePreferences, getPreferences } from '../services/preferences'
import { toTitleCase } from '../utils/formatters'
import { Card, Select, Label, Alert, PageLoading } from '../components/ui'

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
        const vehiclesPayload = (vehiclesRes.data?.data ?? vehiclesRes.data) as any
        const vehiclesList: any[] = Array.isArray(vehiclesPayload) ? vehiclesPayload : Array.isArray(vehiclesPayload?.items) ? vehiclesPayload.items : []
        setVehicles(vehiclesList)

        const preferences = preferencesRes.data?.data ?? preferencesRes.data ?? {}
        setDefaultVehicleId(preferences.defaultVehicleId ?? '')
        setDefaultFuelType(preferences.defaultFuelType ?? '')
        setDefaultPaymentType(preferences.defaultPaymentType ?? '')
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handlePreferenceChange = async (field: 'vehicle' | 'fuelType' | 'paymentType', value: string) => {
    const oldVehicleId = defaultVehicleId
    const oldFuelType = defaultFuelType
    const oldPaymentType = defaultPaymentType

    if (field === 'vehicle') {
      setDefaultVehicleId(value)
    } else if (field === 'fuelType') {
      setDefaultFuelType(value)
    } else if (field === 'paymentType') {
      setDefaultPaymentType(value)
    }

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
    <div className="app-page max-w-3xl space-y-5">
      <section className="app-hero p-5 md:p-7">
        <p className="app-eyebrow app-hero-muted">Preferences</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Settings</h1>
        <p className="mt-2 text-sm app-hero-muted">Defaults applied when adding a new fuel record.</p>
      </section>

      <Card className="section-panel p-5 md:p-6">
        <h2 className="text-base font-semibold text-foreground mb-1">Defaults</h2>
        <p className="mb-5 text-sm text-muted-foreground">These choices prefill new fuel records.</p>

        {loading && <PageLoading label="Loading settings..." />}
        {error && <Alert className="mb-4">{error}</Alert>}

        {!loading && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="settings-vehicle">Vehicle</Label>
              <Select
                id="settings-vehicle"
                value={defaultVehicleId}
                onChange={(e) => handlePreferenceChange('vehicle', e.target.value)}
                disabled={saving}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((v) => {
                  const id = String(v.id ?? v._id ?? v.vehicleId ?? '')
                  const name = v.name ?? v.vehicleName ?? 'Unknown'
                  return <option key={id} value={id}>{name}</option>
                })}
              </Select>
            </div>

            <div>
              <Label htmlFor="settings-fuel">Fuel Type</Label>
              <Select
                id="settings-fuel"
                value={defaultFuelType}
                onChange={(e) => handlePreferenceChange('fuelType', e.target.value)}
                disabled={saving}
              >
                <option value="">Select fuel type</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>{toTitleCase(type)}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="settings-payment">Payment Method</Label>
              <Select
                id="settings-payment"
                value={defaultPaymentType}
                onChange={(e) => handlePreferenceChange('paymentType', e.target.value)}
                disabled={saving}
              >
                <option value="">Select payment method</option>
                {paymentTypes.map((type) => (
                  <option key={type} value={type}>{toTitleCase(type)}</option>
                ))}
              </Select>
            </div>

            {saving && (
              <p className="text-sm text-muted-foreground" role="status">Saving preferences...</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
