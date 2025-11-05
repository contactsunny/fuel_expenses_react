import { api, endpoints, url } from './api'

export function getUserVehicles() {
  return api.get(url(endpoints.vehicles.baseUrl, endpoints.vehicles.getUserVehicles))
}

export function createVehicle(payload: any) {
  return api.post(url(endpoints.vehicles.baseUrl, endpoints.vehicles.createVehicle), payload)
}

export function updateVehicle(id: string, payload: any) {
  const path = endpoints.vehicles.updateVehicle.replace('{id}', id)
  return api.put(url(endpoints.vehicles.baseUrl, path), payload)
}

export function deleteVehicle(id: string) {
  const path = endpoints.vehicles.deleteVehicle.replace('{id}', id)
  return api.delete(url(endpoints.vehicles.baseUrl, path))
}


