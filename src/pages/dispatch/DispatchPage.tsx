import { Plus } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import {
  getDispatchBoardApi,
  exportDispatchApi,
} from "../../services/auth.service";
import PageHeader from "../../components/common/PageHeader";
import DispatchTable from "../../components/dispatch/DispatchTable";
import EditDispatchModal from "../../components/assign_loads/modal/EditDispatchModal";
import { useState } from "react";
import CalendarModal from "../../components/common/modal/CalendorModal";
import TableFilters from "../../components/common/TableFilters";
import AssignLoadsExpandModal from "../../components/assign_loads/modal/AssignLoadsExpandModal";
import CommonButton from "../../components/common/CommonButton";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import CreatePickupModal from "../../components/pickup/modal/CreatePickupModal";
import type { DispatchBoardItem } from "../../types/auth.types";

const Dispatch = () => {
const [dispatchModal, setDispatchModal] = useState<"none" | "create" | "edit">("none");

const [selectedDate, setSelectedDate] = useState<[Dayjs | null, Dayjs | null]>([
  null,
  null,
]);
  const [date, setDate] = useState<any | null>(null);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null,
  );
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [showDispatchDetails, setShowDispatchDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [entries, setEntries] = useState(10);
  const [period, setPeriod] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [dispatchData, setDispatchData] = useState<DispatchBoardItem[]>([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const handleOpenPickupModal = () => {
    setOpenPickupModal(true);
  };

  const handleClosePickupModal = () => {
    setOpenPickupModal(false);
  };

  const handleOnView = (item: DispatchBoardItem) => {
    setDate(item.date);
    setIsCanceled(item.status !== "Active");
    setShowDispatchDetails(true);
  };

  const filteredData = dispatchData
    .filter((item) => {
      const searchValue = search.trim().toLowerCase();
      if (!searchValue) return true;

      return (
        (item.dispatchNo || item.id).toLowerCase().includes(searchValue) ||
        (item.customer || "").toLowerCase().includes(searchValue) ||
        (item.jobCode || "").toLowerCase().includes(searchValue) ||
        item.status.toLowerCase().includes(searchValue)
      );
    })
    .filter((item) => {
      if (!statusFilter) return true;
      if (statusFilter === "active") return item.status === "Active";
      if (statusFilter === "close") return item.status === "Closed";
      return true;
    })
    .filter((item) => {
      const [start, end] = selectedDate;
      if (!start || !end) return true;

      const itemDate = dayjs(item.date);
      return (
        itemDate.isSame(start, "day") ||
        itemDate.isSame(end, "day") ||
        (itemDate.isAfter(start, "day") && itemDate.isBefore(end, "day"))
      );
    })
    .filter((item) => {
      if (period === "All") return true;
      const itemDate = new Date(item.date);
      const today = new Date();

      if (period === "this_week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return itemDate >= weekStart;
      }

      if (period === "this_month") {
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      }

      if (period === "this_year") {
        return itemDate.getFullYear() === today.getFullYear();
      }

      return true;
    })
    .slice(0, entries);

  const formatDateRange = () => {
    const [start, end] = selectedDate;
    if (!start && !end) return "";
    if (start && !end) return start.format("DD/MM/YYYY");
    if (start && end) {
      return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
    }
    return "";
  };

  const loadDispatches = async (page = 1) => {
    try {
      const res = await getDispatchBoardApi(page, pagination.limit);
      setDispatchData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("Dispatch API Error:", err.response?.data || err.message);
      } else {
        console.log("Dispatch API Error:", err);
      }
    }
  };

  useEffect(() => {
    loadDispatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadDispatch = async (item: DispatchBoardItem) => {
    try {
      const res = await exportDispatchApi(item.id);

      const blob = new Blob([JSON.stringify(res, null, 2)], {
        type: "application/json",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `dispatch-${item.dispatchNo || item.id}.json`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch"
        description="Enables you to track the status of the loads"
      >
        <div className="flex gap-3 ml-auto">
          <CommonButton
            variant="primary"
            size="md"
            onClick={() => {
              setShowDispatchDetails(false);
              setDispatchModal("create");
            }}
          >
            <Plus size={18} />
            Create Dispatch
          </CommonButton>
        </div>
      </PageHeader>
      <div className="bg-white p-4 overflow-hidden">
        <TableFilters
          period={period}
          onPeriodChange={setPeriod}
          searchValue={search}
          onSearchChange={setSearch}
          dateRange={formatDateRange()}
          onDateClick={() => setOpenCalendarModal(true)}
          onEntriesChange={setEntries}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isSettingFilter={true}
        />

        <DispatchTable
          data={filteredData}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(page) => {
            loadDispatches(page);
          }}
          onView={handleOnView}
          onEdit={(item) => {
            setSelectedDispatchId(item.id);
            setDispatchModal("edit");
          }}
          onCopy={() => {}}
          onDownload={handleDownloadDispatch}
        />
      </div>

      <EditDispatchModal
        open={dispatchModal === "edit"}
        onClose={() => setDispatchModal("none")}
        isEdit
        dispatchId={selectedDispatchId}
        onOpenPickupModal={handleOpenPickupModal}
        loadDispatches={loadDispatches}
      />

      <EditDispatchModal
        open={dispatchModal === "create"}
        onClose={() => setDispatchModal("none")}
        title="Create Dispatch"
        onOpenPickupModal={handleOpenPickupModal}
        loadDispatches={loadDispatches}
      />
      <CreatePickupModal
        open={openPickupModal}
        onClose={handleClosePickupModal}
      />
      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
        onApply={setSelectedDate}
      />

      <AssignLoadsExpandModal
        open={showDispatchDetails}
        onClose={() => setShowDispatchDetails(false)}
        isCanceled={isCanceled}
        date={date}
        setDate={setDate}
      />
    </div>
  );
};

export default Dispatch;