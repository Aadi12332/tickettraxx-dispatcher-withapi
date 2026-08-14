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

export interface DispatchBoardColumn {
  column: number;
  loadId: string;
  jobId: string;
  jobCode: string;
  customer: string;
  material: string;
  pickup: string;
  delivery: string;
  numberOfLoads: number;
  invoiceRate: number;
  contractorRate: number;
  amountInvoice: number;
  amountContractor: number;
}

export interface DispatchBoardItem {
  id: string;
  dispatchNo?: string;
  date: string;
  status: string;
  customer: string | null;
  jobCode: string | null;
  material: string | null;
  pickup: string | null;
  delivery: string | null;
  startTime: string | null;
  endTime: string | null;
  comment: string | null;
  totalLoads: number;
  invoiceTotal: number;
  contractorTotal: number;
  columns: DispatchBoardColumn[];
}

export interface DispatchBoardPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DispatchBoardResponse {
  data: DispatchBoardItem[];
  pagination: DispatchBoardPagination;
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

export interface AmountPaidItem {
  _id: string;
  ticketNo?: string;
  jobId?: string;
  jobCode?: string;
  date?: string;
  driverId?: string;
  driverName?: string;
  amountPaid?: number;
}

export interface AmountPaidResponse {
  data: AmountPaidItem[];
  totalAmountPaid: number;
  pagination: Pagination;
}

export interface Ticket {
  _id: string;
  ticketNo?: string;
  tripId?: any;
  loadId?: { _id: string; loadNo?: string } | null;
  jobId?: { _id: string; code?: string } | null;
  customerId?: { _id: string; name?: string } | null;
  contractorId?: { _id: string; companyName?: string } | null;
  driverId?: { _id: string; name?: string } | null;
  date?: string;
  pickupSiteId?: { _id: string; name?: string; address?: string } | null;
  dropSiteId?: { _id: string; name?: string; address?: string } | null;
  materialId?: { _id: string; name?: string } | null;
  tonnage?: number;
  invoiceRate?: number;
  contractorRate?: number;
  amount?: number;
  contractorAmount?: number;
  fscPct?: number;
  approvalStatus?: string;
  billingStatus?: string;
  statementId?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TicketListResponse {
  data: Ticket[];
  pagination: TicketPagination;
}

export interface StatementLineItem {
  ticketId: string;
  ticketNo: string;
  date: string;
  pickup?: string;
  deliver?: string;
  tonnage?: number;
  contractorRate?: number;
  contractorAmount?: number;
  fscPct?: number;
  fscAmount?: number;
}

export interface Statement {
  statementNo: string;
  driverId: string;
  driverType?: string;
  contractorId?: string;
  truckId?: string | null;
  payPeriod?: { from: string; to: string };
  lineItems: StatementLineItem[];
  ticketIds: string[];
  gross: number;
  payPercent?: number;
  payAmount?: number;
  fscTotal?: number;
  deductionsTotal?: number;
  deductionApplications?: any[];
  netPay?: number;
  status?: string;
  paidAt?: string | null;
  _id?: string;
}

export interface GeneratedStatementEntry {
  driverId: string;
  driverName: string;
  statement: Statement;
}

export interface BulkGenerateResponse {
  data: {
    generated: GeneratedStatementEntry[];
    skippedNoTickets: { driverId: string; driverName: string }[];
    failed: any[];
    fixedPaymentTypeDrivers: any[];
  };
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
  phone: string | any;
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
  contractorId?: string;
  thirdPartyCustomerId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  contractorRate: number;
  invoiceRate: number;
}

export interface UpdateSitePayload {
  type?: SiteType;
  name?: string;
  customerId?: string;
  contractorId?: string;
  thirdPartyCustomerId?: string;
  address?: string;
  lat?: number;
  lng?: number;
  contractorRate?: number;
  invoiceRate?: number;
}

export interface SiteResponse {
  data: Site;
}

export interface Job {
  _id: string;
  code: string;
  customerId: Customer | string;
  thirdPartyCustomerId: Customer | string | null;
  pickupSiteId: Site | string;
  deliverySiteId: Site | string;
  materialId: Material | string | null;
  rate: number;
  contractorRate?: number;
  date?: string;
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

export interface DriverPerformance {
  rating: null;
  driverId: string;
  name: string;
  completedTrips: number;
  remainingLoads: number;
  onTimePct: number;
  revenue: number;
}

export interface RevenueChartPoint {
  date: string;
  tickets: number;
  revenue: number;
}

export interface RevenueMonthPoint {
  month: string;
  revenue: number;
}

export interface RevenueSummary {
  total: number;
  yoyPercent: number | null;
  monthlySeries: RevenueMonthPoint[];
  period: string;
}

export interface ShipmentByCustomer {
  count: number;
  customerId: string;
  name: string;
}

export interface KpiTrendPoint {
  date: string;
  value: number;
}

export interface KpiTrend {
  series: KpiTrendPoint[];
  current: number;
  changePct: number;
}

export interface KpiTrends {
  loadsDispatchedToday: KpiTrend;
  loadsRemainingToday: KpiTrend;
  trucksInTransit: KpiTrend;
  trucksDispatched: KpiTrend;
}

export interface DispatcherDashboard {
  loadsDispatchedToday: number;
  loadsRemainingToday: number;
  trucksInTransit: number;
  trucksDispatched: number;
  driverPerformance: DriverPerformance[];
  revenueChart: RevenueChartPoint[];
  revenueSummary: RevenueSummary;
  shipmentsByCustomer: ShipmentByCustomer[];
  kpiTrends: KpiTrends;
}

export interface DispatcherDashboardResponse {
  data: DispatcherDashboard;
}

export interface DriverAccess {
  app: boolean;
  fsc: boolean;
  earning: boolean;
}

export interface ContractorDriver {
  _id: string;
  name: string;
  driverCode?: string;
  userId: string | null;
  contractorId: string;
  type: string;
  phone?: string;
  email?: string;
  state?: string;
  city?: string;
  address?: string;
  dob: string | null;
  payPercent?: number;
  rate?: number;
  paymentType?: string;
  access: DriverAccess;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobsCount: number;
  unitNumber: string | null;
}

export interface ContractorTruck {
  truckName: string;
  _id: string;
  unitNumber: string;
  alias: string[];
  contractorId: string;
  assignedDriverId: string | null;
  loadThisMonth: number;
  status: string;
  nextMaintenanceDueAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignedFromDate?: string;
  operationalStatus: string;
}

export interface ContractorRecentJob {
  _id: string;
  loadNo: string;
  customerId: { _id: string; name: string; code: string } | null;
  contractorId: string;
  jobId: { _id: string; code: string } | string | null;
  dispatchId: string | null;
  date: string;
  numberOfTrips: number;
  invoiceRate: number;
  contractorRate: number;
  pickupSiteId: { _id: string; name: string } | null;
  deliverySiteId: { _id: string; name: string } | null;
  materialId: { _id: string; name: string } | null;
  truckId: { _id: string; unitNumber?: string; truckName?: string } | string | null;
  weightPerTrip: number;
  status: string;
  eta: string | null;
  miles: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UploadedFile {
  name?: string;
  storageKey?: string;
  url: string;
}

// SINGLE merged Contractor type (aapki file me 2 alag definitions thi — consolidate kar diya).
// NOTE: do naming variants mile the: usdot/usdotNumber, ownerOperatorFleet/ownerOperatorOrFleet,
// payPercentage/payPercent. Dono ko optional rakha hai taaki kuch break na ho — apni actual
// API response check karke jo naam sahi hai wahi rakhna, doosra hata dena.
export interface Contractor {
  _id: string;
  companyName: string;
  name?: string;
  contractorCode?: string;
  primaryDriverName?: string;
  parkingLocation?: string;
  unitNumber?: string;
  phone: string;
  email: string;
  address?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  signatureDate?: string | null;
  expirationDate?: string | null;
  idType?: string;
  idNumber?: string;
  contactName?: string;
  autoSendRenewalReminders?: boolean;

  usdot?: string;
  usdotNumber?: string;
  txdot?: string;
  txdotNumber?: string;
  ownerOperatorFleet?: string;
  ownerOperatorOrFleet?: string;
  payPercentage?: string;
  payPercent?: string;
  // trucks?: string;
  truckCount?: string;
  phoneCode?: string;

  contractDocument?: UploadedFile;
  coiDocument?: UploadedFile;

  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractorDetail extends Contractor {
  drivers: ContractorDriver[];
  trucks: ContractorTruck[];
  jobsTotal: number;
  recentJobs: ContractorRecentJob[];
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

export interface ContractorDetailResponse {
  data: ContractorDetail;
}

// Create/update JSON payload — files ke liye alag se uploadContractorFilesApi use karo
export interface ContractorPayload {
  companyName: string;
  primaryDriverName: string;
  unitNumber: string;
  phone: string;
  email: string;
  parkingLocation?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  signatureDate?: string;
  expirationDate?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  contactName?: string;
  autoSendRenewalReminders?: boolean;
  usdot?: string;
  usdotNumber?: string;
  txdot?: string;
  txdotNumber?: string;
  ownerOperatorFleet?: string;
  ownerOperatorOrFleet?: string;
  payPercentage?: string;
  payPercent?: string;
  trucks?: string;
  truckCount?: string;
  phoneCode?: string;
  status?: string;
}

export interface ContractorResponse {
  data: Contractor;
}

export interface Load {
  _id: string;
  loadNo: string;
  customerId: Customer | string;
  contractorId: Contractor | string | null;
  jobId: Job | string;
  dispatchId: string;
  startTime: string;
  endTime: string;
  comment?: string;
  numberOfTrips: number;
  invoiceRate: number;
  contractorRate: number;
  pickupSiteId: Site | string;
  deliverySiteId: Site | string;
  materialId: Material | string;
  status: string;
  eta: string | null;
  miles: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoadPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LoadListResponse {
  data: Load[];
  pagination: LoadPagination;
}

export interface CreateLoadPayload {
  customerId: string;
  dispatchId: string;
  jobId: string;
  materialId: string;
  pickupSiteId: string;
  deliverySiteId: string;
  numberOfTrips: number;
  invoiceRate: number;
  contractorRate: number;
  startTime: string;
  endTime: string;
  comment?: string;
}

export interface UpdateLoadPayload {
  customerId?: string;
  dispatchId?: string;
  jobId?: string;
  materialId?: string;
  pickupSiteId?: string;
  deliverySiteId?: string;
  numberOfTrips?: number;
  invoiceRate?: number;
  contractorRate?: number;
  startTime?: string;
  endTime?: string;
  comment?: string;
  status?: string;
}

export interface LoadResponse {
  data: Load;
}

export interface Driver {
  _id: string;
  name: string;
  contractorId: string;
  state?: string;
  city?: string;
  address?: string;
  parkingLocation?: string;
  phone?: string;
  email?: string;
  medicalCardUrl?: string;
  cdlUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverResponse {
  data: Driver;
}

export interface Truck {
  _id: string;
  unitNumber: string;
  contractorId: string;
  assignedDriverId?: string | null;
  alias?: string;
  truckName?: string;
  year?: string;
  vinNumber?: string;
  dotInspectionUrl?: string;
  operationalStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface TruckResponse {
  data: Truck;
}

// Job payload me contractorRate, date, weightPerTrip bhi lagte hain (add-job curl ke mutabik)
export interface CreateJobPayload {
  code: string;
  customerId: string;
  pickupSiteId: string;
  deliverySiteId: string;
  materialId?: string;
  thirdPartyCustomerId?: string;
  rate: number;
  contractorRate?: number;
  date?: string;
  weightPerTrip?: number;
}

export interface Truck {
  _id: string;
  unitNumber: string;
  contractorId: string;
  assignedDriverId?: string | null;
  truckName?: string;
  year?: string;
  vinNumber?: string;
  operationalStatus: string;
}

export interface TruckPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TruckListResponse {
  data: Truck[];
  pagination: TruckPagination;
}

export interface AssignmentLoad {
  _id: string;
  loadNo: string;
  customerId?: { _id: string; name: string; code?: string } | null;
  pickupSiteId?: { _id: string; name: string; address?: string } | null;
  deliverySiteId?: { _id: string; name: string; address?: string } | null;
  materialId?: { _id: string; name: string } | null;
  invoiceRate?: number;
  weightPerTrip?: number;
  startTime?: string;
  endTime?: string;
  status: string;
}

export interface Assignment {
  _id: string;
  driverId?: { _id: string; name: string; phone?: string } | null;
  truckId?: { _id: string; unitNumber: string; status?: string } | null;
  contractorId?: { _id: string; companyName: string } | null;
  loadId?: AssignmentLoad | null;
  date: string;
  loadsCount: number;
  status: string;
}

export interface AssignmentSummary {
  loads: number;
  rate: number | null;
  jobId: string | null;
  customerId: string;
  deliverySite?: string;
  jobCode?: string;
}

export interface AssignmentListResponse {
  data: Assignment[];
  summary: AssignmentSummary[];
}

export interface DispatchRecord {
  _id: string;
  date: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDispatchPayload {
  date: string;
}

export interface DispatchResponse {
  data: DispatchRecord;
}