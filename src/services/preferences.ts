import { api } from './api'

const API_BASE = "https://api.fuel.contactsunny.com"

export function savePreferences(payload: {
  defaultVehicleId?: string
  defaultFuelType?: string
  defaultPaymentType?: string
}) {
  return api.post(`${API_BASE}/preferences`, payload)
}

export function getPreferences() {
  return api.get(`${API_BASE}/preferences`)
}

