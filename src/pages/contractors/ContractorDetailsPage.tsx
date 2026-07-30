// @ts-nocheck
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import axios from "axios";
import {
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  Search,
  Star,
  Users,
  FileText,
  Truck,
  ClipboardList,
  BadgeCheckIcon,
  MessageCircleIcon,
  CreditCard,
  Calendar,
  Trash,
  CopyIcon,
  SquarePen,
  FolderOpen,
  MoreVertical,
  Mic,
  MicOff,
  X,
} from "lucide-react";
import CommonButton from "../../components/common/CommonButton";
import placeholderUser from "../../assets/images/placeholderUser.svg";
import Table from "../../components/common/Table";
import AddJobModal from "../../components/contractor/AddJobModal";
import DriverSection from "../../components/contractor/DriverSection";
import AmountPaidTab from "../../components/contractor/AmountPaidTab";
import TruckDetailsTab from "../../components/contractor/TruckDetailsTab";
import TicketsTab from "../../components/contractor/TicketsTab";
import SettlementStatementTab from "../../components/contractor/SettlementStatementTab";
import ContractorModal from "../../components/contractor/ContractorModal";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import {
  getContractorByIdApi,
  deactivateContractorApi,
  reactivateContractorApi,
  deleteContractorApi,
} from "../../services/auth.service";
import type { ContractorDetail } from "../../types/auth.types";

const truckTableData = [
  {
    id: 1,
    truckId: "123131",
    truckName: "Volvo",
    capacity: "50",
    truckStatus: "Available",
  },
  {
    id: 2,
    truckId: "123242",
    truckName: "Volvo",
    capacity: "60",
    truckStatus: "Available",
  },
];

const truckColumns = [
  { label: "Truck ID", key: "truckId" },
  { label: "Truck Name", key: "truckName" },
  { label: "Capacity(Tons)", key: "capacity" },
  { label: "Status", key: "truckStatus" },
];

const statusDot: Record<string, string> = {
  orange: "#F26522",
  green: "#22C55E",
  red: "#EF4444",
};

// Job status -> dot color mapping (jobs list ke liye)
const jobStatusDot = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "completed" || s === "delivered") return "green";
  if (s === "rejected" || s === "cancelled") return "red";
  return "orange";
};

const dummyPastJobs = [
  {
    id: 1,
    date: "15 May 2026",
    route: "Chicago-San Fransico",
    material: "Sand",
    weight: "50tonnes",
    truckId: "121324",
    dotColor: "orange",
  },
];

const TABS = [
  { key: "overview", label: "Overview", icon: <Star size={14} /> },
  { key: "drivers", label: "Drivers", icon: <Users size={14} /> },
  { key: "amount-paid", label: "Amount Paid", icon: <FileText size={14} /> },
  { key: "truck-details", label: "Truck Details", icon: <Truck size={14} /> },
  { key: "tickets", label: "Tickets", icon: <FolderOpen size={14} /> },
  { key: "statement", label: "Statement", icon: <ClipboardList size={14} /> },
];

const ContractorDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [jobSearch, setJobSearch] = useState("");

  const [contractor, setContractor] = useState<ContractorDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState(
    "You have successfully updated the contractor.",
  );

  const handleToggleStatus = async () => {
    if (!id) return;

    setActionLoading(true);
    try {
      if (isActive) {
        await deactivateContractorApi(id);
      } else {
        await reactivateContractorApi(id);
      }
      setIsActive((prev) => !prev);
    } catch (err) {
      console.error("Failed to update contractor status:", err);
    } finally {
      setActionLoading(false);
      setShowConfirmTooltip(false);
    }
  };

  const fetchContractor = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await getContractorByIdApi(id);
      console.log(res.data);
      console.log(res.data.recentJobs);
      console.log(res.data.recentJobs[0]);
      setContractor(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to load contractor.");
      } else {
        setError("Unable to load contractor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Real jobs ho to unhi se cards banao — pickup/deliver/material is response me null hain,
  // isliye wahan "-" dikhta hai (dummy data nahi ghadha)
const pastJobs = contractor
  ? contractor.recentJobs.map((job) => ({
      id: job._id,
      date: dayjs(job.date).format("DD MMM YYYY"),

      customer: job.customerId?.name ?? "-",

      route: `${job.pickupSiteId?.name ?? "-"} → ${job.deliverySiteId?.name ?? "-"}`,

      material: job.materialId?.name ?? "-",

      weight: `${job.weightPerTrip ?? 0} tons`,

      truckId:
        typeof job.truckId === "object"
          ? job.truckId?.unitNumber ?? "-"
          : job.truckId ?? "-",

      jobCode: job.jobId?.code ?? "-",

      contractorRate: job.contractorRate ?? "-",

      invoiceRate: job.invoiceRate ?? "-",

      status: job.status ?? "-",

      dotColor: jobStatusDot(job.status),
    }))
  : dummyPastJobs;

  const filteredPastJobs = pastJobs.filter((job) => {
    const value = jobSearch.toLowerCase();

    return (
      job.date.toLowerCase().includes(value) ||
      job.route.toLowerCase().includes(value) ||
      job.material.toLowerCase().includes(value) ||
      job.weight.toLowerCase().includes(value) ||
      job.truckId.toLowerCase().includes(value)
    );
  });

  const [openEditContractorModal, setOpenEditContractorModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showConfirmTooltip, setShowConfirmTooltip] = useState(false);

  const handleEditSuccess = () => {
    setSuccessTitle("You have successfully updated the contractor.");
    setShowSuccessModal(true);
    fetchContractor();
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteContractorApi(id);
      setSuccessTitle("You have successfully deleted the contractor.");
      setShowSuccessModal(true);
      setTimeout(() => navigate("/contractors"), 1200);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete contractor.");
      } else {
        setError("Unable to delete contractor.");
      }
    }
  };

  const [openCallModal, setOpenCallModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (contractor) setIsActive(contractor.status === "active");
  }, [contractor]);

  const displayName = contractor?.companyName || "Loading...";
  const displayPhone = contractor?.phone || "-";
  const displayEmail = contractor?.email || "-";
  // Address/USDOT/TxDOT contractor detail API me nahi aate — dummy hi rehte hain
  const displayAddress = "1861 Bayonne Ave,\nManchester, NJ, 08759";
  const usdot = "1234567";
  const txdot = "TX-98765";

  const handleSendMail = () => {
    const subject = encodeURIComponent(`Hello ${displayName}`);
    const body = encodeURIComponent(`Hi,`);

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${displayEmail}&su=${subject}&body=${body}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-2 pb-10 px-0">
      {/* ── Back navigation ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 cursor-pointer text-sm text-[#374151] hover:text-[#233B73] transition-colors font-medium"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Contractors
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-[#E8E8E8] overflow-visible md:relative">
        {/* Avatar */}
        <div className="md:absolute md:left-4 md:top-2/4 md:translate-y-[-46%] md:z-10 flex sm:block justify-center pt-5 md:pt-0 px-6 md:px-0">
          <div className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] lg:h-[130px] lg:w-[130px] rounded-full bg-[#EAEAEA] border-[3px] border-white shadow-md overflow-hidden shrink-0">
            <img
              src={placeholderUser}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name + buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start md:items-center md:pl-[148px] lg:pl-[156px] px-4 sm:pl-6 pt-3 md:pt-5 pb-4 md:pb-8 gap-3 sm:gap-4 pr-2 rounded-t-xl bg-white">
          <div className="flex-1 min-w-0 text-center sm:text-left w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-[#1B2D6B] leading-tight text-nowrap">
                {displayName}
              </h1>
              {contractor?.status === "active" && (
                <BadgeCheckIcon
                  fill="#03C95A"
                  className="text-white shrink-0"
                />
              )}
            </div>
            <p className="text-[#1D3461] text-xs sm:text-sm lg:text-base mt-0.5 font-normal text-nowrap">
              {contractor?.contractorCode || ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            <button
              onClick={() => setOpenCallModal(true)}
              className="gap-2 bg-[#233B73] hover:bg-[#1c305d] text-white text-sm font-medium h-9 sm:h-10 xl:w-[186px] rounded-[5px] px-2 transition-colors flex justify-center items-center"
            >
              <Phone size={14} />
              Call
            </button>
            <button
              onClick={handleSendMail}
              className="flex justify-center items-center gap-2 bg-[#233B73] hover:bg-[#1c305d] text-white text-sm font-medium h-9 sm:h-10 px-2 xl:w-[180px] rounded-[5px] transition-colors"
            >
              <MessageCircleIcon size={15} />
              Message
            </button>
            <div className="relative">
              <button
                onClick={() => setShowConfirmTooltip(!showConfirmTooltip)}
                className={`flex justify-center items-center gap-2 ${
                  isActive ? "bg-[#C76363] hover:bg-[#a04e4e]" : "bg-[#03C95A]"
                } text-white text-sm font-medium h-9 sm:h-10 px-2 xl:w-[186px] rounded-[5px] transition-colors whitespace-nowrap cursor-pointer`}
              >
                {isActive ? "Deactivate Account" : "Activate Account"}
              </button>

              {showConfirmTooltip && (
                <div className="absolute top-[calc(100%+12px)] right-0 md:w-[400px] w-[280px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50">
                  <h3 className="text-[15px] font-semibold text-center text-black mb-2">
                    Are you sure want to {isActive ? "deactivate" : "activate"}{" "}
                    the account
                  </h3>
                  <p className="text-[11px] text-center text-black leading-relaxed mb-4">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                      className="flex-1 bg-[#03C95A] hover:bg-[#008f35] text-white py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? "Please wait..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setShowConfirmTooltip(false)}
                      className="flex-1 bg-[#E30000] hover:bg-[#c20000] text-white py-2 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute -bottom-2 right-[90px] w-4 h-4 bg-white transform rotate-45 border-b border-r border-gray-100"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gray meta strip */}
        <div className="bg-[#D4D4D4] border-t border-[#E8E8E8] rounded-b-xl md:pl-[148px] lg:pl-[156px] px-4 sm:px-6 py-2 xl:py-6 flex flex-wrap gap-x-6 sm:gap-x-8 lg:gap-x-10 gap-y-2 text-xs xl:text-sm text-[#374151]">
          <div className="flex items-center gap-1.5">
            <CreditCard size={18} />
            <span className="text-[#1D3461]">Contractor ID :</span>
            <span className="font-normal text-[#1D3461]">
              {contractor?.contractorCode || "-"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={18} />
            <span className="text-[#1D3461]">Added on :</span>
            <span className="font-normal text-[#1D3461]">
              {contractor
                ? dayjs(contractor.createdAt).format("Do MMM YYYY")
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#1D3461]">USDOT:</span>
            <span className="font-normal text-[#1D3461]">{usdot}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#1D3461]">TxDOT:</span>
            <span className="font-normal text-[#1D3461]">{txdot}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-xs px-4 sm:px-6 py-5">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base xl:text-xl font-bold text-[#1B2D6B]">
            Basic Information
          </h2>
          <button
            className="text-[#6B7280] hover:text-[#374151] transition-colors ml-1 cursor-pointer"
            onClick={() => setOpenEditContractorModal(true)}
          >
            <SquarePen size={18} />
          </button>
          <button
            className="flex items-center text-[#6B7280] justify-center hover:text-red-600 rounded transition-colors shrink-0 cursor-pointer"
            onClick={handleDelete}
          >
            <Trash size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-center gap-3 min-w-0">
            <Phone size={15} className="text-[#9CA3AF] shrink-0" />
            <span className="text-sm text-[#6B7280] w-14 flex-shrink-0">
              Phone
            </span>
            <span className="text-sm text-[#374151] font-medium truncate sm:ml-10 ml-0">
              {displayPhone}
            </span>
          </div>

          <div className="flex items-start gap-3 md:row-span-2">
            <MapPin size={15} className="text-[#9CA3AF] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#6B7280] w-14 flex-shrink-0">
              Address
            </span>
            <span className="text-sm text-[#374151] font-medium sm:ml-10 ml-0 leading-snug md:text-start flex-1">
              {displayAddress}
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <Mail size={15} className="text-[#9CA3AF] flex-shrink-0" />
            <span className="text-sm text-[#6B7280] w-14 flex-shrink-0">
              Email
            </span>
            <a
              href={`mailto:${displayEmail}`}
              className="text-sm text-[#233B73] font-medium hover:underline truncate sm:ml-10 ml-0"
            >
              {displayEmail}
            </a>
            <button className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors ml-1 shrink-0 cursor-pointer">
              <CopyIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E8E8E8] overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-[#E8E8E8] overflow-x-auto scrollbar-hide justify-start lg:justify-between flex-wrap">
          {TABS.map((tab) => {
            const isTabActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-2 sm:px-3 py-3 sm:py-3
                  text-[11px] sm:text-sm font-medium whitespace-nowrap
                  transition-colors border-b-2 flex-shrink-0 cursor-pointer
                  ${
                    isTabActive
                      ? "border-[#F26522] text-[#F26522]"
                      : "border-transparent text-[#6B7280] hover:text-[#374151]"
                  }
                `}
              >
                <span
                  className={isTabActive ? "text-[#F26522]" : "text-[#9CA3AF]"}
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Overview tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            {/* Drivers section */}
            <DriverSection
              drivers={contractor?.drivers}
              loading={loading}
              contractorId={id}
            />

            {/* Truck Details section */}
            <div className="">
              <div className="flex items-center justify-between gap-3 p-2 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
                  Truck Details
                </h3>
                <CommonButton
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    navigate("/contractors/add-truck", {
                      state: { contractorId: id },
                    })
                  }
                >
                  Add Truck
                </CommonButton>
              </div>
              <div className="p-4">
                <Table
                data={
                  contractor
                    ? contractor.trucks.map((t) => ({
                        id: t._id,
                        truckId: t.unitNumber,
                        truckName: t.truckName ?? "-",
                        capacity: "-",
                        truckStatus: t.operationalStatus,
                      }))
                    : truckTableData
                }
                columns={truckColumns}
                isCheckbox={false}
                minWidth="min-w-[600px]"
              />
              </div>
            </div>

            <div className="border border-[#E5E7EB]">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
                  Past Jobs
                </h3>
                <CommonButton
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddJobModal(true)}
                >
                  Add Job
                </CommonButton>
              </div>

              {/* Total + Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-4 pb-3 border-t border-[#E5E7EB] pt-4">
                <p className="text-sm font-bold text-[#1B2D6B]">
                  Total No of Jobs : {contractor?.jobsTotal ?? 45}
                </p>
                <div className="relative w-full sm:w-auto">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <input
                    type="text"
                    placeholder="Search"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    className="w-full sm:w-56 pl-9 pr-4 h-9 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#233B73] bg-white"
                  />
                </div>
              </div>

              {/* Job cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-3 sm:px-4 pb-4">
                {filteredPastJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-[#E5E7EB] rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                  >
                    {/* Date + kebab */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#6B7280]">{job.date}</span>
                      <button className="text-[#6B7280] hover:text-[#374151] transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                   <div className="flex items-center gap-2 mb-2">
  <span
    className="w-2.5 h-2.5 rounded-full"
    style={{ backgroundColor: statusDot[job.dotColor] }}
  />
  <p className="text-sm font-bold text-[#1B2D6B]">
    {job.customer}
  </p>
</div>

<p className="text-xs text-[#6B7280]">
  Route: {job.route}
</p>

<p className="text-xs text-[#6B7280]">
  Material: {job.material}
</p>

<p className="text-xs text-[#6B7280]">
  Weight: {job.weight}
</p>

<p className="text-xs text-[#6B7280]">
  Job: {job.jobCode}
</p>

<p className="text-xs text-[#6B7280]">
  Truck ID: {job.truckId}
</p>
                  </div>
                ))}
              </div>
              {filteredPastJobs.length === 0 && (
                <p className="w-[98%] mx-auto mb-5 h-20 border border-[#E5E7EB] rounded-lg flex items-center justify-center text-[#6B7280]">
                  No jobs found
                </p>
              )}

              <div className="flex justify-center pb-5">
                <CommonButton size="sm">View All</CommonButton>
              </div>
            </div>
          </div>
        )}

        {activeTab === "drivers" && (
          <DriverSection
            drivers={contractor?.drivers}
            loading={loading}
            contractorId={id}
          />
        )}
        {activeTab === "amount-paid" && <AmountPaidTab />}
        {activeTab === "truck-details" && (
          <TruckDetailsTab
            trucks={contractor?.trucks}
            drivers={contractor?.drivers}
            loading={loading}
          />
        )}
        {activeTab === "tickets" && <TicketsTab />}
        {activeTab === "statement" && <SettlementStatementTab />}
      </div>

      <AddJobModal
        open={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onSuccess={fetchContractor}
      />
      <ContractorModal
        open={openEditContractorModal}
        onClose={() => setOpenEditContractorModal(false)}
        isEdit
        editData={contractor}
        onSuccess={handleEditSuccess}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
      />

      {openCallModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setOpenCallModal(false)}
          />

          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="w-full max-w-[600px] rounded-xl bg-[#162341] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5">
                <h2 className="text-[#87C8E8] text-[20px] font-semibold">
                  TICKET<span className="text-[#fff]">TRAXX</span>
                </h2>

                <button
                  className="cursor-pointer"
                  onClick={() => setOpenCallModal(false)}
                >
                  <X size={28} className="text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col items-center pt-10 pb-5 px-5">
                <img
                  src={placeholderUser}
                  alt="placeholderUser"
                  className="w-[100px] h-[100px] rounded-full border-4 border-white object-cover"
                />

                <h2 className="mt-5 text-white text-[24px] font-bold">
                  {displayName}
                </h2>

                <p className="text-white text-[16px] mt-2">{displayPhone}</p>

                <p className="text-white text-[16px] mt-2">Voice Call</p>

                {/* Mute */}
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="mt-10 w-[48px] h-[48px] cursor-pointer rounded-full bg-[#455271] flex items-center justify-center"
                >
                  {isMuted ? (
                    <MicOff size={22} color="white" />
                  ) : (
                    <Mic size={22} color="white" />
                  )}
                </button>

                {/* End Call */}
                <button
                  onClick={() => setOpenCallModal(false)}
                  className="mt-10 w-full h-[54px] cursor-pointer rounded-full bg-[#FF140A] flex items-center justify-center hover:bg-red-700 transition"
                >
                  <Phone size={24} color="white" className="rotate-[135deg]" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContractorDetailsPage;
