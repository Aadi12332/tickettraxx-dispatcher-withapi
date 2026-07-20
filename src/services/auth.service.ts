import axiosInstance from "./axiosInstance";
import { AUTH_ENDPOINTS, DISPATCH_ENDPOINTS, NOTIFICATION_ENDPOINTS } from "../constants/api.constants";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  NotificationResponse,
  AlertResponse,
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

export const getNotificationsApi = async (): Promise<NotificationResponse> => {
  const { data } = await axiosInstance.get<NotificationResponse>(
    NOTIFICATION_ENDPOINTS.NOTIFICATIONS
  );

  return data;
};

export const getAlertsApi = async (): Promise<AlertResponse> => {
  const { data } = await axiosInstance.get<AlertResponse>(
    NOTIFICATION_ENDPOINTS.ALERTS
  );

  return data;
};

export const markNotificationReadApi = async (
  notificationId: string
) => {
  const { data } = await axiosInstance.patch(
    NOTIFICATION_ENDPOINTS.MARK_READ(notificationId)
  );

  return data;
};

export const markAllNotificationsReadApi = async () => {
  const { data } = await axiosInstance.post(
    NOTIFICATION_ENDPOINTS.MARK_ALL_READ
  );

  return data;
};

export const getDispatchesApi = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${DISPATCH_ENDPOINTS.GET_DISPATCHES}?page=${page}&limit=${limit}`
  );

  return data;
};

export const exportDispatchApi = async (id: string) => {
  const { data } = await axiosInstance.get(
    DISPATCH_ENDPOINTS.EXPORT_DISPATCH(id)
  );

  return data;
};