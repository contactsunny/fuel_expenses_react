import { api, endpoints, url } from './api';
export function getServiceRecords(startDate, endDate) {
    const params = {
        startDate: formatDate(startDate, 'start'),
        endDate: formatDate(endDate, 'end'),
    };
    return api.get(url(endpoints.serviceRecords.baseUrl, endpoints.serviceRecords.getUserServiceRecords), { params });
}
export function createServiceRecord(payload) {
    return api.post(url(endpoints.serviceRecords.baseUrl, endpoints.serviceRecords.createServiceRecord), payload);
}
export function updateServiceRecord(id, payload) {
    const path = endpoints.serviceRecords.updateServiceRecord.replace('{id}', id);
    return api.put(url(endpoints.serviceRecords.baseUrl, path), payload);
}
export function deleteServiceRecord(id) {
    const path = endpoints.serviceRecords.deleteServiceRecord.replace('{id}', id);
    return api.delete(url(endpoints.serviceRecords.baseUrl, path));
}
function formatDate(d, which) {
    const yyyy = d.getFullYear().toString().padStart(4, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${which === 'start' ? '000000' : '235959'}`;
}
