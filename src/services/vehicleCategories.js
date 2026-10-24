import { api, endpoints, url } from './api';
export function getUserVehicleCategories() {
    return api.get(url(endpoints.vehicleCategories.baseUrl, endpoints.vehicleCategories.getAll));
}
export function createVehicleCategory(payload) {
    return api.post(url(endpoints.vehicleCategories.baseUrl, endpoints.vehicleCategories.create), payload);
}
export function updateVehicleCategory(id, payload) {
    const path = endpoints.vehicleCategories.update.replace('{id}', id);
    return api.put(url(endpoints.vehicleCategories.baseUrl, path), payload);
}
export function deleteVehicleCategory(id) {
    const path = endpoints.vehicleCategories.delete.replace('{id}', id);
    return api.delete(url(endpoints.vehicleCategories.baseUrl, path));
}
