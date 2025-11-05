import axios, { type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create()

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    const headers: Record<string, string> = (config.headers as any) ?? {}
    headers['token'] = token
    config.headers = headers as any
  }
  return config
})

const API_BASE = 'https://api.fuel.contactsunny.com'

export const endpoints = {
  auth: {
    baseUrl: `${API_BASE}/user`,
    login: '/login',
    logout: '/logout',
  },
  fuel: {
    baseUrl: `${API_BASE}/fuel`,
    createFuel: '',
    getFuel: '',
    updateFuel: '/{id}',
    deleteFuel: '/{id}',
  },
  analytics: {
    baseUrl: `${API_BASE}/analytics`,
    vehicleCategory: '/vehicleCategory',
    fuelPrice: '/fuelPrice',
    fuelType: '/fuelType',
  },
  vehicles: {
    baseUrl: `${API_BASE}/vehicle`,
    createVehicle: '',
    getUserVehicles: '',
    updateVehicle: '/{id}',
    deleteVehicle: '/{id}',
  },
  serviceRecords: {
    baseUrl: `${API_BASE}/serviceRecord`,
    createServiceRecord: '',
    getUserServiceRecords: '',
    updateServiceRecord: '/{id}',
    deleteServiceRecord: '/{id}',
  },
}

export function url(base: string, path: string) {
  return `${base}${path}`
}


