import axios, { type InternalAxiosRequestConfig } from "axios";

export const api = axios.create();

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    const headers: Record<string, string> = (config.headers as any) ?? {};
    headers["token"] = token;
    config.headers = headers as any;
  }
  return config;
});

function readApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!value) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Set it in .env or .env.local.",
    );
  }
  return value.replace(/\/+$/, "");
}

export const API_BASE = readApiBaseUrl();

export const endpoints = {
  auth: {
    baseUrl: `${API_BASE}/user`,
    login: "/login",
    logout: "/logout",
  },
  fuel: {
    baseUrl: `${API_BASE}/fuel`,
    createFuel: "",
    getFuel: "",
    updateFuel: "/{id}",
    deleteFuel: "/{id}",
  },
  analytics: {
    baseUrl: `${API_BASE}/analytics`,
    vehicleCategory: "/vehicleCategory",
    fuelPrice: "/fuelPrice",
    fuelType: "/fuelType",
  },
  vehicles: {
    baseUrl: `${API_BASE}/vehicle`,
    createVehicle: "",
    getUserVehicles: "",
    updateVehicle: "/{id}",
    deleteVehicle: "/{id}",
  },
  vehicleCategories: {
    baseUrl: `${API_BASE}/vehicleCategory`,
    create: "",
    getAll: "",
    update: "/{id}",
    delete: "/{id}",
  },
  serviceRecords: {
    baseUrl: `${API_BASE}/serviceRecord`,
    createServiceRecord: "",
    getUserServiceRecords: "",
    updateServiceRecord: "/{id}",
    deleteServiceRecord: "/{id}",
  },
  preferences: {
    baseUrl: `${API_BASE}/preferences`,
  },
};

export function url(base: string, path: string) {
  return `${base}${path}`;
}
