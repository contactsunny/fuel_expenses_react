import { api, endpoints, url } from './api'

export function getUserVehicleCategories() {
  return api.get(url(endpoints.vehicleCategories.baseUrl, endpoints.vehicleCategories.getAll))
}
