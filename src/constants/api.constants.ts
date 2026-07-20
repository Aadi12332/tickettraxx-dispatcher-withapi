export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://65.1.152.16/api";

export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot",
  VERIFY_OTP: "/auth/otp/verify",
  RESET_PASSWORD: "/auth/reset",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

export const NOTIFICATION_ENDPOINTS = {
  NOTIFICATIONS: "/notifications",
  ALERTS: "/alerts",
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/read-all",
} as const;

export const DISPATCH_ENDPOINTS = {
  GET_DISPATCHES: "/dispatches",
  EXPORT_DISPATCH: (id: string) => `/dispatches/${id}/export`,
} as const;