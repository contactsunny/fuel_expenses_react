import { api, endpoints } from './api'

export function savePreferences(payload: {
  defaultVehicleId?: string
  defaultFuelType?: string
  defaultPaymentType?: string
}) {
  return api.post(endpoints.preferences.baseUrl, payload)
}

export function getPreferences() {
  return api.get(endpoints.preferences.baseUrl)
}

