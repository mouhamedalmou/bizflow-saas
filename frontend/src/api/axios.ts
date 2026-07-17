import axios, { type AxiosError, type AxiosInstance } from "axios";
import type { ApiErrorBody } from "../types";

const api: AxiosInstance = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("user");
  }

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  } else if (storedUser) {
    localStorage.removeItem("user");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("bizflow:auth-expired"));
    }

    return Promise.reject(error);
  }
);

export default api;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;
  const axiosError: AxiosError<ApiErrorBody> = error;
  return axiosError.response?.data?.message ?? axiosError.response?.data?.error ?? fallback;
};
