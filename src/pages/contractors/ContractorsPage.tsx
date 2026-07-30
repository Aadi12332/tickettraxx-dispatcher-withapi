import { useEffect, useMemo, useState } from "react";
import { Calendar1, Funnel, Plus, RefreshCcw } from "lucide-react";
import axios from "axios";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import CommonButton from "../../components/common/CommonButton";
import StatsCard from "../../components/common/StatCard";
import userGroup from "../../assets/icons/usersGroup.svg";
import activeUsers from "../../assets/icons/userShare.svg";
import activeDrivers from "../../assets/icons/userPlus.svg";
import inActiveUsers from "../../assets/icons/userPause.svg";
import { useNavigate } from "react-router-dom";
import CalendarModal from "../../components/common/modal/CalendorModal";
import ContractorModal from "../../components/contractor/ContractorModal";
import CommonFilterDropdown from "../../components/common/CommonFilterDropdown";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import CommonSearchInput from "../../components/common/CommonSearchInput";
import ExportButton from "../../components/common/ExportButton";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import {
  getContractorsApi,
  deleteContractorApi,
  updateContractorApi,
} from "../../services/auth.service";
import type { Contractor, ContractorPagination } from "../../types/auth.types";

export const columns = [
  { label: "Driver Name", key: "driverName" },
  { label: "Contractor", key: "contractor" },
  { label: "Parking Location", key: "parkingLocation" },
  { label: "Unit Number", key: "unitNumber" },
  { label: "Phone", key: "phone" },
  { label: "Email", key: "email" },
  { label: "Status", key: "status" },
  { label: "Details", key: "actions", minWidth: "100px" },
];

type ContractorRow = Contractor & {
  id: string;
  driverName: string;
  contractor: string;
  phone: string;
  status: "Active" | "Inactive";
};

const mapContractorToRow = (item: Contractor): ContractorRow => ({
  ...item,
  id: item._id,
  driverName: item?.primaryDriverName ?? "",
  contractor: item.companyName,
  phone: item.phone || "-",
  status: item.status === "active" ? "Active" : "Inactive",
});

const ContractorsPage = () => {
  const [search, setSearch] = useState("");
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [openCreateContractorModal, setOpenCreateContractorModal] =
    useState(false);
  const [editContractorModalOpen, setEditContractorModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [selectedDate, setSelectedDate] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
const [filter, setFilter] = useState("all");
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<ContractorPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState(
    "You have successfully loaded the contractors.",
  );

  const fetchContractors = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await getContractorsApi(page, limit);
      setContractors(res.data);
      setPagination(res.pagination);
    } catch {
      setError("Unable to load contractors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = () => {
    setSuccessTitle("You have successfully loaded the contractors.");
    fetchContractors(pagination.page, pagination.limit);
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleCreateSuccess = () => {
    setSuccessTitle("You have successfully added the contractor.");
    fetchContractors(1, pagination.limit);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleUpdateSuccess = () => {
    setSuccessTitle("You have successfully updated the contractor.");
    fetchContractors(pagination.page, pagination.limit);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const formatDateRange = () => {
    const [start, end] = selectedDate;

    if (!start && !end) return "Select Date Range";

    if (start && !end) return start.format("DD/MM/YYYY");

    if (start && end) {
      return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
    }

    return "Select Date Range";
  };

  const handleStatusToggle = async (item: ContractorRow) => {
    const newStatus = item.status === "Active" ? "inactive" : "active";
    try {
      await updateContractorApi(item._id, { status: newStatus });
      fetchContractors(pagination.page, pagination.limit);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to update status.");
      } else {
        setError("Unable to update status.");
      }
    }
  };

  const navigate = useNavigate();

  const rows = useMemo(
    () => contractors.map(mapContractorToRow),
    [contractors],
  );

  const filteredData = useMemo(() => {
    let filtered = [...rows];

    // Search — current page ke data par (server-side search param nahi diya gaya hai)
    if (search.trim()) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }

    // Date Range Filter
    const [start, end] = selectedDate;

    if (start || end) {
      filtered = filtered.filter((item) => {
        const itemDate = dayjs(item.createdAt);

        if (start && !end) {
          return itemDate.isSame(start, "day");
        }

        if (start && end) {
          return (
            itemDate.isSame(start, "day") ||
            itemDate.isSame(end, "day") ||
            (itemDate.isAfter(start, "day") && itemDate.isBefore(end, "day"))
          );
        }

        return true;
      });
    }

    // Period dropdown filter (30/90/180/365 days)
if (filter !== "all") {
  const days = Number(filter);

  filtered = filtered.filter((item) => {
    const itemDate = dayjs(item.createdAt);
    return itemDate.isAfter(dayjs().subtract(days, "day"));
  });
}

    return filtered;
  }, [rows, search, filter, selectedDate]);

  const handleDelete = async (item: ContractorRow) => {
    try {
      await deleteContractorApi(item._id);
      if (contractors.length === 1 && pagination.page > 1) {
        fetchContractors(pagination.page - 1, pagination.limit);
      } else {
        fetchContractors(pagination.page, pagination.limit);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete contractor.");
      } else {
        setError("Unable to delete contractor.");
      }
    }
  };

  // Static hai kyunki abhi koi stats API nahi di gayi hai
  const statsData = [
    {
      title: "Total Contractors",
      value: pagination.total,
      icon: <img src={userGroup} alt="userGroup" className="" />,
    },
    {
      title: "Active Contractors",
      value: rows.filter((r) => r.status === "Active").length,
      icon: <img src={activeUsers} alt="activeUsers" className="" />,
    },
    {
      title: "Inactive Contractors",
      value: rows.filter((r) => r.status === "Inactive").length,
      icon: <img src={inActiveUsers} alt="inActiveUsers" className="" />,
    },
    {
      title: "Active Drivers",
      value: rows.filter((r) => r.status === "Active").length,
      icon: <img src={activeDrivers} alt="activeDrivers" className="" />,
    },
    {
      title: "Inactive Drivers",
      value: rows.filter((r) => r.status === "Inactive").length,
      icon: <img src={inActiveUsers} alt="inActiveDrivers" className="" />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contractors"
        description="Create, edit and deactivate subcontractors"
      >
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 ml-auto">
          <CommonButton
            variant="primary"
            size="xs"
            icon={<Plus size={18} />}
            onClick={() => setOpenCreateContractorModal(true)}
          >
            Add Contractor
          </CommonButton>
          {/* Export */}
          <ExportButton
            onClick={() => {
              console.log("Export started...");
            }}
          />

          {/* Refresh */}
          <CommonButton
            size="sm"
            variant="secondary"
            iconOnly
            icon={<RefreshCcw className="xl:size-4 size-3 shrink-0" />}
            onClick={handleUpdate}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 xl:gap-3 bg-white p-4">
        {statsData.map((item, index) => (
          <StatsCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="">
        <div className="space-y-4">
          <div className=" bg-white p-4">
            <div className="flex items-center gap-3 flex-wrap mb-5">
              <CommonSearchInput
                placeholder="Search"
                size="md"
                value={search}
                onChange={setSearch}
              />
              <button
                onClick={() => setOpenCalendarModal(true)}
                className="bg-white border border-(--border-gray-2) rounded-[5px] h-[36px] px-2 xl:px-4 py-1 xl:py-2 flex items-center gap-3 cursor-pointer w-fit"
              >
                <Calendar1 size={16} />
                <span className="text-sm font-normal">{formatDateRange()}</span>
              </button>
              <CommonFilterDropdown
                size="130px"
                title="Filter"
                value={filter}
                onChange={setFilter}
                icon={<Funnel size={15} />}
                options={[
                  { label: "All", value: "all" },
                  { label: "30 Days", value: "30" },
                  { label: "90 Days", value: "90" },
                  { label: "180 Days", value: "180" },
                  { label: "365 Days", value: "365" },
                ]}
              />
            </div>

            {loading ? (
              <p className="text-sm text-[#979797] py-6 text-center">
                Loading contractors...
              </p>
            ) : (
              <Table
                columns={columns}
                data={filteredData}
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(page: number) => {
                  fetchContractors(page, pagination.limit);
                }}
                onEdit={(item) => {
                  setSelectedContractor(item as ContractorRow);
                  setEditContractorModalOpen(true);
                }}
                onDelete={(item) => handleDelete(item as ContractorRow)}
                onStatusToggle={(item) =>
                  handleStatusToggle(item as ContractorRow)
                }
                onRowClick={(item) => navigate(`/contractors/view/${item.id}`)}
              />
            )}
          </div>
        </div>
      </div>
      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
        onApply={setSelectedDate}
      />

      <ContractorModal
        open={openCreateContractorModal}
        onClose={() => setOpenCreateContractorModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ContractorModal
        open={editContractorModalOpen}
        onClose={() => {
          setEditContractorModalOpen(false);
          setSelectedContractor(null);
        }}
        isEdit
        editData={selectedContractor}
        onSuccess={handleUpdateSuccess}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
      />
    </div>
  );
};

export default ContractorsPage;
