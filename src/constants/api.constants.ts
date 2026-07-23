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

export const MATERIAL_ENDPOINTS = {
  MATERIALS: "/materials",
  MATERIAL_BY_ID: (id: string) => `/materials/${id}`,
} as const;

export const DISPATCH_ENDPOINTS = {
  GET_DISPATCHES: "/dispatches",
  EXPORT_DISPATCH: (id: string) => `/dispatches/${id}/export`,
} as const;

export const FSC_ENDPOINTS = {
  FSC: "/fsc",
  FSC_BY_ID: (id: string) => `/fsc/${id}`,
} as const;
 
export const CUSTOMER_ENDPOINTS = {
  CUSTOMERS: "/customers",
  CREATE_CUSTOMER: "/customers",
};

export const API_CONSTANTS = {
  SITES: {
    BASE: "/sites",
    BY_ID: (id: string) => `/sites/${id}`,
  },
};

export const CONTRACTOR_ENDPOINTS = {
  CONTRACTORS: "/contractors",
  CONTRACTOR_BY_ID: (id: string) => `/contractors/${id}`,
} as const;
 
export const JOB_ENDPOINTS = {
  JOBS: "/jobs",
  JOB_BY_ID: (id: string) => `/jobs/${id}`,
} as const;

export const DASHBOARD_ENDPOINTS = {
  DISPATCHER: "/dashboard/dispatcher",
} as const;

export const LOAD_ENDPOINTS = {
  LOADS: "/loads",
  LOAD_BY_ID: (id: string) => `/loads/${id}`,
} as const;