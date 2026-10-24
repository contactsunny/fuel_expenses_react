import { api, endpoints, url } from './api';
function params(startDate, endDate) {
    return {
        startDate: formatDate(startDate, 'start'),
        endDate: formatDate(endDate, 'end'),
    };
}
export function getCategoryAnalytics(startDate, endDate) {
    return api.get(url(endpoints.analytics.baseUrl, endpoints.analytics.vehicleCategory), { params: params(startDate, endDate) });
}
export function getFuelPriceAnalytics(startDate, endDate) {
    return api.get(url(endpoints.analytics.baseUrl, endpoints.analytics.fuelPrice), { params: params(startDate, endDate) });
}
export function getFuelTypeAnalytics(startDate, endDate) {
    return api.get(url(endpoints.analytics.baseUrl, endpoints.analytics.fuelType), { params: params(startDate, endDate) });
}
function formatDate(d, which) {
    const yyyy = d.getFullYear().toString().padStart(4, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${which === 'start' ? '000000' : '235959'}`;
}
