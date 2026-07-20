export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
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

export type OtpPurpose = "login" | "reset";

export interface VerifyOtpPayload {
  identifier: string;
  code: string;
  purpose: OtpPurpose;
}

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

export interface ApiError {
  message: string;
  status?: number;
}