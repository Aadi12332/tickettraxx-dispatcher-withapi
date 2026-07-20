export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  contractorId: string | null;
  customerId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  otpAttempts: number;
  verified: boolean;
  otpExpiresAt: string | null;
  passwordResetExpiresAt: string | null;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface ForgotPasswordResponse {
  sent: boolean;
  devCode?: string;
}

// purpose "login" -> phone/OTP login flow, "reset" -> forgot-password flow
export type OtpPurpose = "login" | "reset";

export interface VerifyOtpPayload {
  identifier: string;
  code: string;
  purpose: OtpPurpose;
}

// Backend response shape changes with purpose:
// - "login" purpose returns full login tokens + user
// - "reset" purpose just confirms the code is valid
export interface VerifyOtpResponse {
  verified?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface ResetPasswordPayload {
  identifier: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  reset: boolean;
}

// Generic API error shape jo axios interceptor se throw hoga
export interface ApiError {
  message: string;
  status?: number;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  kind: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "success" | "warning" | "error";
  channels: string[];
  status: string;
  read: boolean;
  readAt: string | null;
  customerId: string | null;
  contractorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotificationResponse {
  data: NotificationItem[];
  pagination: Pagination;
  unread: number;
}

export interface AlertResponse {
  data: NotificationItem[];
  pagination: Pagination;
  unread: number;
}

export interface DispatchItem {
  _id: string;
  date: string;
  total: string;
  status: "Active" | "Closed";
  notes?: string;
}

export interface DispatchTableProps {
  data: DispatchItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;

  onView?: (item: DispatchItem) => void;
  onEdit?: (item: DispatchItem) => void;
  onCopy?: (item: DispatchItem) => void;
  onDownload?: (item: DispatchItem) => void;
}