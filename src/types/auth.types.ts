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

export interface Material {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MaterialListResponse {
  data: Material[];
  pagination: MaterialPagination;
}

export interface CreateMaterialPayload {
  name: string;
}

export interface UpdateMaterialPayload {
  name: string;
}

export interface CreateMaterialResponse {
  data: Material;
}

export interface UpdateMaterialResponse {
  data: Material;
}

export interface Customer {
  _id: string;
  name: string;
  code: string;
  email: string;
  billingEmail: string;
  thirdPartyCustomerId: string | null;
  status: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: CustomerPagination;
}
export interface Fsc {
  _id: string;
  customerId: Customer | string;
  fromDate: string;
  toDate: string;
  percentage: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FscPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FscListResponse {
  data: Fsc[];
  pagination: FscPagination;
}

export interface CreateFscPayload {
  customerId: string;
  fromDate: string;
  toDate: string;
  percentage: number;
}

export interface UpdateFscPayload {
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  percentage?: number;
}

export interface FscResponse {
  data: Fsc;
}

export interface CustomerRef {
  _id: string;
  name: string;
  code: string;
  email: string;
  billingEmail: string;
  thirdPartyCustomerId: string | null;
  status: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteType = "pickup" | "deliver";

export interface Site {
  _id: string;
  customerId: CustomerRef;
  type: SiteType;
  name: string;
  address?: string;
  contractorRate: number;
  invoiceRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SitesPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetSitesResponse {
  data: Site[];
  pagination: SitesPagination;
}

export interface CreateSitePayload {
  type: SiteType;
  name: string;
  customerId: string;
  address?: string;
  contractorRate: number;
  invoiceRate: number;
}

export interface UpdateSitePayload {
  type?: SiteType;
  name?: string;
  customerId?: string;
  address?: string;
  contractorRate?: number;
  invoiceRate?: number;
}

export interface SiteResponse {
  data: Site;
}

export interface Contractor {
  _id: string;
  companyName: string;
  primaryDriverName: string;
  unitNumber: string;
  email: string;
  status: string;
  parkingLocation?: string;
  createdAt: string;
  updatedAt: string;

  // ContractorModal ke extra fields — API response me abhi nahi dikhe,
  // lekin form save karte waqt bhejte hain, backend jo support kare wo save karega
  zipCode?: string;
  state?: string;
  city?: string;
  usdot?: string;
  txdot?: string;
  signatureDate?: string;
  expirationDate?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  ownerOperatorFleet?: string;
  phoneCode?: string;
  companyTelephone?: string;
  payPercentage?: string;
  contactName?: string;
  trucks?: string;
  truckCount?: string;
  autoRenewal?: boolean;
}

export interface ContractorPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ContractorListResponse {
  data: Contractor[];
  pagination: ContractorPagination;
}

export interface ContractorPayload {
  companyName: string;
  primaryDriverName: string;
  unitNumber: string;
  email: string;
  parkingLocation?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  usdot?: string;
  txdot?: string;
  signatureDate?: string;
  expirationDate?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  ownerOperatorFleet?: string;
  phoneCode?: string;
  companyTelephone?: string;
  payPercentage?: string;
  contactName?: string;
  trucks?: string;
  truckCount?: string;
  autoRenewal?: boolean;
  status?: string;
}

export interface ContractorResponse {
  data: Contractor;
}

export interface Job {
  _id: string;
  code: string;
  customerId: Customer | string;
  thirdPartyCustomerId: string | null;
  pickupSiteId: Site | string;
  deliverySiteId: Site | string;
  materialId: Material | string | null;
  rate: number;
  totalLoads: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface JobListResponse {
  data: Job[];
  pagination: JobPagination;
}

export interface CreateJobPayload {
  code: string;
  customerId: string;
  pickupSiteId: string;
  deliverySiteId: string;
  materialId?: string;
  thirdPartyCustomerId?: string;
  rate: number;
  contractorRate?: number;
}

export interface UpdateJobPayload {
  code?: string;
  customerId?: string;
  pickupSiteId?: string;
  deliverySiteId?: string;
  materialId?: string;
  thirdPartyCustomerId?: string;
  rate?: number;
  contractorRate?: number;
  totalLoads?: number;
  status?: string;
}

export interface JobResponse {
  data: Job;
}