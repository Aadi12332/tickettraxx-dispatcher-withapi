import axiosInstance from "./axiosInstance";
import { AUTH_ENDPOINTS } from "../constants/api.constants";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types/auth.types";

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    AUTH_ENDPOINTS.LOGIN,
    payload
  );
  return data;
};

export const forgotPasswordApi = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosInstance.post<ForgotPasswordResponse>(
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    payload
  );
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    AUTH_ENDPOINTS.VERIFY_OTP,
    payload
  );
  return data;
};

export const resetPasswordApi = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { data } = await axiosInstance.post<ResetPasswordResponse>(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    payload
  );
  return data;
};

export const logoutApi = async () => {
  const { data } = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
  return data;
};