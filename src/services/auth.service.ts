import axiosInstance from "./axiosInstance";
import {
  API_CONSTANTS,
  ASSIGNMENT_ENDPOINTS,
  AUTH_ENDPOINTS,
  CONTRACTOR_ACTION_ENDPOINTS,
  CONTRACTOR_ENDPOINTS,
  CUSTOMER_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  DISPATCH_ENDPOINTS,
  DRIVER_ENDPOINTS,
  FSC_ENDPOINTS,
  JOB_ENDPOINTS,
  LOAD_ENDPOINTS,
  MATERIAL_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  TRUCK_ENDPOINTS,
} from "../constants/api.constants";
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
  UpdateMaterialPayload,
  UpdateMaterialResponse,
  CreateMaterialPayload,
  CreateMaterialResponse,
  MaterialListResponse,
  CustomerListResponse,
  FscListResponse,
  CreateFscPayload,
  UpdateFscPayload,
  FscResponse,
  GetSitesResponse,
  CreateSitePayload,
  SiteResponse,
  UpdateSitePayload,
  ContractorListResponse,
  ContractorPayload,
  ContractorResponse,
  ContractorDetailResponse,
  JobListResponse,
  CreateJobPayload,
  JobResponse,
  UpdateJobPayload,
  DispatcherDashboardResponse,
  LoadResponse,
  CreateLoadPayload,
  LoadListResponse,
  UpdateLoadPayload,
  DriverResponse,
  TruckResponse,
  TruckListResponse,
  AssignmentListResponse,
  CreateDispatchPayload,
  DispatchResponse,
} from "../types/auth.types";

// ---------- Auth ----------
export const loginApi = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    AUTH_ENDPOINTS.LOGIN,
    payload,
  );
  return data;
};

export const forgotPasswordApi = async (
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosInstance.post<ForgotPasswordResponse>(
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    payload,
  );
  return data;
};

export const verifyOtpApi = async (
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> => {
  const { data } = await axiosInstance.post<VerifyOtpResponse>(
    AUTH_ENDPOINTS.VERIFY_OTP,
    payload,
  );
  return data;
};

export const resetPasswordApi = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  const { data } = await axiosInstance.post<ResetPasswordResponse>(
    AUTH_ENDPOINTS.RESET_PASSWORD,
    payload,
  );
  return data;
};

// ---------- Notifications / Alerts ----------
export const getNotificationsApi = async (): Promise<NotificationResponse> => {
  const { data } = await axiosInstance.get<NotificationResponse>(
    NOTIFICATION_ENDPOINTS.NOTIFICATIONS,
  );
  return data;
};

export const getAlertsApi = async (): Promise<AlertResponse> => {
  const { data } = await axiosInstance.get<AlertResponse>(
    NOTIFICATION_ENDPOINTS.ALERTS,
  );
  return data;
};

export const markNotificationReadApi = async (notificationId: string) => {
  const { data } = await axiosInstance.patch(
    NOTIFICATION_ENDPOINTS.MARK_READ(notificationId),
  );
  return data;
};

export const markAllNotificationsReadApi = async () => {
  const { data } = await axiosInstance.post(
    NOTIFICATION_ENDPOINTS.MARK_ALL_READ,
  );
  return data;
};

// ---------- Dispatch ----------
export const getDispatchesApi = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${DISPATCH_ENDPOINTS.GET_DISPATCHES}?page=${page}&limit=${limit}`,
  );
  return data;
};

export const createDispatchApi = async (
  payload: CreateDispatchPayload,
): Promise<DispatchResponse> => {
  const { data } = await axiosInstance.post<DispatchResponse>(
    DISPATCH_ENDPOINTS.CREATE_DISPATCH,
    payload,
  );
  return data;
};

export const exportDispatchApi = async (id: string) => {
  const { data } = await axiosInstance.get(
    DISPATCH_ENDPOINTS.EXPORT_DISPATCH(id),
  );
  return data;
};

// ---------- Materials ----------
export const getMaterialsApi = async (
  page = 1,
  limit = 20,
): Promise<MaterialListResponse> => {
  const { data } = await axiosInstance.get<MaterialListResponse>(
    MATERIAL_ENDPOINTS.MATERIALS,
    { params: { page, limit } },
  );
  return data;
};

export const createMaterialApi = async (
  payload: CreateMaterialPayload,
): Promise<CreateMaterialResponse> => {
  const { data } = await axiosInstance.post<CreateMaterialResponse>(
    MATERIAL_ENDPOINTS.MATERIALS,
    payload,
  );
  return data;
};

export const updateMaterialApi = async (
  id: string,
  payload: UpdateMaterialPayload,
): Promise<UpdateMaterialResponse> => {
  const { data } = await axiosInstance.patch<UpdateMaterialResponse>(
    MATERIAL_ENDPOINTS.MATERIAL_BY_ID(id),
    payload,
  );
  return data;
};

export const deleteMaterialApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(MATERIAL_ENDPOINTS.MATERIAL_BY_ID(id));
};

// ---------- Customers ----------
export const getCustomersApi = async (
  page = 1,
  limit = 100,
): Promise<CustomerListResponse> => {
  const { data } = await axiosInstance.get<CustomerListResponse>(
    CUSTOMER_ENDPOINTS.CUSTOMERS,
    { params: { page, limit } },
  );
  return data;
};

export const createCustomerApi = async (name: string) => {
  const { data } = await axiosInstance.post("/customers", { name });
  return data;
};

// ---------- FSC ----------
export const getFscApi = async (
  page = 1,
  limit = 20,
): Promise<FscListResponse> => {
  const { data } = await axiosInstance.get<FscListResponse>(FSC_ENDPOINTS.FSC, {
    params: { page, limit },
  });
  return data;
};

export const createFscApi = async (
  payload: CreateFscPayload,
): Promise<FscResponse> => {
  const { data } = await axiosInstance.post<FscResponse>(
    FSC_ENDPOINTS.FSC,
    payload,
  );
  return data;
};

export const updateFscApi = async (
  id: string,
  payload: UpdateFscPayload,
): Promise<FscResponse> => {
  const { data } = await axiosInstance.patch<FscResponse>(
    FSC_ENDPOINTS.FSC_BY_ID(id),
    payload,
  );
  return data;
};

export const deleteFscApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(FSC_ENDPOINTS.FSC_BY_ID(id));
};

// ---------- Sites ----------
export const siteService = {
  getSites: async (params?: {
    page?: number;
    limit?: number;
    type?: "pickup" | "deliver";
    search?: string;
  }): Promise<GetSitesResponse> => {
    const response = await axiosInstance.get<GetSitesResponse>(
      API_CONSTANTS.SITES.BASE,
      { params },
    );
    return response.data;
  },

  createSite: async (payload: CreateSitePayload): Promise<SiteResponse> => {
    const response = await axiosInstance.post<SiteResponse>(
      API_CONSTANTS.SITES.BASE,
      payload,
    );
    return response.data;
  },

  updateSite: async (
    id: string,
    payload: UpdateSitePayload,
  ): Promise<SiteResponse> => {
    const response = await axiosInstance.patch<SiteResponse>(
      API_CONSTANTS.SITES.BY_ID(id),
      payload,
    );
    return response.data;
  },

  deleteSite: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_CONSTANTS.SITES.BY_ID(id));
  },
};

export const getContractorsApi = async (
  page = 1,
  limit = 20,
): Promise<ContractorListResponse> => {
  const { data } = await axiosInstance.get<ContractorListResponse>(
    CONTRACTOR_ENDPOINTS.CONTRACTORS,
    { params: { page, limit } },
  );
  return data;
};

export const getContractorByIdApi = async (
  id: string,
): Promise<ContractorDetailResponse> => {
  const { data } = await axiosInstance.get<ContractorDetailResponse>(
    CONTRACTOR_ENDPOINTS.CONTRACTOR_BY_ID(id),
  );
  return data;
};

export const createContractorApi = async (
  payload: ContractorPayload | FormData,
): Promise<ContractorResponse> => {
  const { data } = await axiosInstance.post<ContractorResponse>(
    CONTRACTOR_ENDPOINTS.CONTRACTORS,
    payload,
  );
  return data;
};

export const updateContractorApi = async (
  id: string,
  payload: Partial<ContractorPayload> | { status: string },
): Promise<ContractorResponse> => {
  const { data } = await axiosInstance.patch<ContractorResponse>(
    CONTRACTOR_ENDPOINTS.CONTRACTOR_BY_ID(id),
    payload,
  );
  return data;
};

// Contract/COI files alag se, PATCH + multipart/form-data
export const uploadContractorFilesApi = async (
  id: string,
  formData: FormData,
) => {
  const { data } = await axiosInstance.patch(
    CONTRACTOR_ENDPOINTS.CONTRACTOR_BY_ID(id),
    formData,
  );
  return data;
};

export const deleteContractorApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(CONTRACTOR_ENDPOINTS.CONTRACTOR_BY_ID(id));
};

// ---------- Jobs ----------
export const getJobsApi = async (
  page = 1,
  limit = 20,
): Promise<JobListResponse> => {
  const { data } = await axiosInstance.get<JobListResponse>(
    JOB_ENDPOINTS.JOBS,
    { params: { page, limit } },
  );
  return data;
};

export const createJobApi = async (
  payload: CreateJobPayload,
): Promise<JobResponse> => {
  const { data } = await axiosInstance.post<JobResponse>(
    JOB_ENDPOINTS.JOBS,
    payload,
  );
  return data;
};

export const updateJobApi = async (
  id: string,
  payload: UpdateJobPayload,
): Promise<JobResponse> => {
  const { data } = await axiosInstance.patch<JobResponse>(
    JOB_ENDPOINTS.JOB_BY_ID(id),
    payload,
  );
  return data;
};

export const deleteJobApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(JOB_ENDPOINTS.JOB_BY_ID(id));
};

// ---------- Dashboard ----------
export const getDispatcherDashboardApi =
  async (): Promise<DispatcherDashboardResponse> => {
    const { data } = await axiosInstance.get<DispatcherDashboardResponse>(
      DASHBOARD_ENDPOINTS.DISPATCHER,
    );
    return data;
  };

export const getLoadsApi = async (
  page = 1,
  limit = 20,
): Promise<LoadListResponse> => {
  const { data } = await axiosInstance.get<LoadListResponse>(
    LOAD_ENDPOINTS.LOADS,
    { params: { page, limit } },
  );
  return data;
};

export const createLoadApi = async (
  payload: CreateLoadPayload,
): Promise<LoadResponse> => {
  const { data } = await axiosInstance.post<LoadResponse>(
    LOAD_ENDPOINTS.LOADS,
    payload,
  );
  return data;
};

export const updateLoadApi = async (
  id: string,
  payload: UpdateLoadPayload,
): Promise<LoadResponse> => {
  const { data } = await axiosInstance.patch<LoadResponse>(
    LOAD_ENDPOINTS.LOAD_BY_ID(id),
    payload,
  );
  return data;
};

export const deleteLoadApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(LOAD_ENDPOINTS.LOAD_BY_ID(id));
};

export const deactivateContractorApi = async (id: string) => {
  const { data } = await axiosInstance.post(
    CONTRACTOR_ACTION_ENDPOINTS.DEACTIVATE(id),
  );
  return data;
};

export const reactivateContractorApi = async (id: string) => {
  const { data } = await axiosInstance.post(
    CONTRACTOR_ACTION_ENDPOINTS.REACTIVATE(id),
  );
  return data;
};

export const createDriverApi = async (
  formData: FormData,
): Promise<DriverResponse> => {
  const { data } = await axiosInstance.post<DriverResponse>(
    DRIVER_ENDPOINTS.DRIVERS,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const createTruckApi = async (
  formData: FormData,
): Promise<TruckResponse> => {
  const { data } = await axiosInstance.post<TruckResponse>(
    TRUCK_ENDPOINTS.TRUCKS,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const getTrucksApi = async (
  page = 1,
  limit = 100,
  contractorId?: string,
): Promise<TruckListResponse> => {
  const { data } = await axiosInstance.get<TruckListResponse>(
    TRUCK_ENDPOINTS.TRUCKS,
    { params: { page, limit, contractorId } },
  );
  return data;
};

export const getAssignmentsApi = async (): Promise<AssignmentListResponse> => {
  const { data } = await axiosInstance.get<AssignmentListResponse>(
    ASSIGNMENT_ENDPOINTS.ASSIGNMENTS,
  );
  return data;
};

export const getAssignmentMatrixApi = async (date: string) => {
  const { data,footer }:any = await axiosInstance.get(
    `${ASSIGNMENT_ENDPOINTS.ASSIGNMENTS}/matrix`,
    {
      params: { date },
    }
  );
  return { data, footer };
};

export const getLoadsByDispatchIdApi = async (dispatchId: string) => {
  const { data } = await axiosInstance.get(
    `${LOAD_ENDPOINTS.LOADS}?dispatchId=${dispatchId}`
  );

  return data;
};

export const deleteNotificationApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(id));
};

export const deleteAllNotificationsApi = async (): Promise<void> => {
  await axiosInstance.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL_NOTIFICATIONS);
};

export const deleteAllAlertsApi = async (): Promise<void> => {
  await axiosInstance.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL_ALERTS);
};