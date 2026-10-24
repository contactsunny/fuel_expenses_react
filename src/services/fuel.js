import { api, endpoints, url } from './api';
export function getUserFuel(startDate, endDate) {
    const params = {
        startDate: formatDate(startDate, 'start'),
        endDate: formatDate(endDate, 'end'),
    };
    return api.get(url(endpoints.fuel.baseUrl, endpoints.fuel.getFuel), { params });
}
export function createFuel(payload) {
    return api.post(url(endpoints.fuel.baseUrl, endpoints.fuel.createFuel), payload);
}
export function updateFuel(id, payload) {
    const path = endpoints.fuel.updateFuel.replace('{id}', id);
    return api.put(url(endpoints.fuel.baseUrl, path), payload);
}
export function deleteFuel(id) {
    const path = endpoints.fuel.deleteFuel.replace('{id}', id);
    return api.delete(url(endpoints.fuel.baseUrl, path));
}
function formatDate(d, which) {
    const yyyy = d.getFullYear().toString().padStart(4, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${which === 'start' ? '000000' : '235959'}`;
}
