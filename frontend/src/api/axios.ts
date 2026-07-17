import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { normalizeApiError } from "./errors";
import type { ApiErrorBody, User } from "../types";

interface RetryConfig extends InternalAxiosRequestConfig { _retryCount?: number }
const api: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "/api", timeout: 12_000, headers: { Accept: "application/json" } });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("user");
  if (!stored) return config;
  try { const user = JSON.parse(stored) as Partial<User>; if (user.token) config.headers.Authorization = `Bearer ${user.token}`; else localStorage.removeItem("user"); }
  catch { localStorage.removeItem("user"); }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.code === "ECONNABORTED" && error.config) {
      const config = error.config as RetryConfig; const retryCount = (config._retryCount ?? 0) + 1; config._retryCount = retryCount;
      if (retryCount <= 2) { await new Promise<void>((resolve) => window.setTimeout(resolve, 300 * 2 ** (retryCount - 1))); return api.request(config); }
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) { localStorage.removeItem("user"); window.dispatchEvent(new Event("bizflow:auth-expired")); }
      if (status === 403 && !window.location.pathname.startsWith("/login")) window.location.assign("/dashboard");
      if (status && status >= 500) toast.error("Errore del server. Riprova tra poco.");
    }
    return Promise.reject(normalizeApiError(error));
  },
);

export default api;
export const getApiErrorMessage = (error: unknown, fallback: string): string => normalizeApiError(error, fallback).message;
export const isAxiosApiError = (error: unknown): error is AxiosError<ApiErrorBody> => axios.isAxiosError<ApiErrorBody>(error);
