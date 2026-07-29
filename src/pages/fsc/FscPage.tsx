import { useEffect, useState } from "react";
import { Funnel, PlusCircle, RefreshCcw } from "lucide-react";
import dayjs, { type Dayjs } from "dayjs";
import axios from "axios";

import PageHeader from "../../components/common/PageHeader";
import TableFilters from "../../components/common/TableFilters";
import Table from "../../components/common/Table";
import CommonButton from "../../components/common/CommonButton";
import CreateFscModal, {
  type EditFscData,
} from "../../components/fsc/modal/CreateFscModal";
import CalendarModal from "../../components/common/modal/CalendorModal";
import CommonFilterDropdown from "../../components/common/CommonFilterDropdown";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import ExportButton from "../../components/common/ExportButton";
import { getFscApi, deleteFscApi } from "../../services/auth.service";

export const fscColumns = [
  { label: "Customer", key: "customer" },
  { label: "From", key: "from" },
  { label: "To", key: "to" },
  { label: "Percentage", key: "percentage" },
  { label: "Details", key: "actions" },
];

type FscRow = {
  _id: string;
  customerId: string;
  customer: string;
  from: string; // display: MM/DD/YYYY
  to: string; // display: MM/DD/YYYY
  percentage: string; // display: "8.00%"
  rawFromDate: string; // ISO, API ko bhejne ke liye
  rawToDate: string; // ISO
  rawPercentage: number;
};

type FscPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const FscPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [filter, setFilter] = useState("");

  const [selectedDate, setSelectedDate] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState(
    "You have successfully loaded the FSC."
  );
  const [selectedFsc, setSelectedFsc] = useState<EditFscData | null>(null);

  const [data, setData] = useState<FscRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Table component khud pagination render karta hai — bas API ka pagination object yahan store karna hai
  const [pagination, setPagination] = useState<FscPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchFsc = async (page = pagination.page, limit = entries) => {
    setLoading(true);
    setError("");
    try {
      const res = await getFscApi(page, limit);
      const rows: FscRow[] = res.data.map((item) => {
        const customer =
  item.customerId &&
  typeof item.customerId === "object"
    ? item.customerId
    : null;

return {
  _id: item._id,
  customerId: customer?._id ?? "",
  customer: customer?.name ?? "All Customers",
  from: dayjs(item.fromDate).format("MM/DD/YYYY"),
  to: dayjs(item.toDate).format("MM/DD/YYYY"),
  percentage: `${item.percentage.toFixed(2)}%`,
  rawFromDate: item.fromDate,
  rawToDate: item.toDate,
  rawPercentage: item.percentage,
};
      });
      setData(rows);
      setPagination(res.pagination);
    } catch {
      setError("Unable to load FSC records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Entries (page size) badalte hi page 1 se dobara fetch karo
  useEffect(() => {
    fetchFsc(1, entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const handleUpdate = () => {
    setSuccessTitle("You have successfully loaded the FSC.");
    fetchFsc(pagination.page, entries);
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleCreateSuccess = () => {
    setSuccessTitle("You have successfully created the FSC.");
    // Naya record banega to page 1 par jaake dikhana behtar hai
    fetchFsc(1, entries);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleUpdateSuccess = () => {
    setSuccessTitle("You have successfully updated the FSC.");
    fetchFsc(pagination.page, entries);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleDelete = async (item: FscRow) => {
    try {
      await deleteFscApi(item._id);
      if (data.length === 1 && pagination.page > 1) {
        fetchFsc(pagination.page - 1, entries);
      } else {
        fetchFsc(pagination.page, entries);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete FSC record.");
      } else {
        setError("Unable to delete FSC record.");
      }
    }
  };

  const formatDateRange = () => {
    const [start, end] = selectedDate;

    if (!start && !end) return "";

    if (start && !end) {
      return start.format("DD/MM/YYYY");
    }

    if (start && end) {
      return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
    }

    return "";
  };

  // Note: search/date/period filters current page ke data par hi lagte hain (server-side search param nahi diya gaya hai)
  const filteredData = data
    .filter((item) =>
      item.customer.toLowerCase().includes(search.toLowerCase()),
    )

    .filter((item) => {
      const [start, end] = selectedDate;

      if (!start && !end) return true;

      const itemDate = dayjs(item.from, "MM/DD/YYYY");

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
    })

    .filter((item) => {
      if (!filter) return true;

      const days = Number(filter);

      const itemDate = dayjs(item.from, "MM/DD/YYYY");

      return itemDate.isAfter(dayjs().subtract(days, "day"));
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="FSC"
        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      >
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          <CommonButton
            variant="primary"
            size="md"
            icon={<PlusCircle size={18} />}
            onClick={() => setOpenModal(true)}
          >
            Create New
          </CommonButton>
          <ExportButton
            onClick={() => {
              console.log("Export started...");
            }}
          />

          <CommonButton
            size="md"
            variant="secondary"
            iconOnly
            icon={<RefreshCcw size={18} />}
            onClick={handleUpdate}
          />
        </div>
      </PageHeader>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="bg-white p-4">
        <TableFilters
          searchValue={search}
          onSearchChange={setSearch}
          dateRange={formatDateRange()}
          onDateClick={() => setOpenCalendarModal(true)}
          entries={entries}
          onEntriesChange={setEntries}
        />

        <div className="space-y-4">
          <CommonFilterDropdown
            title="Filter"
            value={filter}
            onChange={setFilter}
            icon={<Funnel size={18} />}
            options={[
              { label: "All", value: "" },
              { label: "30 Days", value: "30" },
              { label: "90 Days", value: "90" },
              { label: "180 Days", value: "180" },
              { label: "365 Days", value: "365" },
            ]}
          />

          {loading ? (
            <p className="text-sm text-[#979797] py-6 text-center">Loading FSC records...</p>
          ) : (
            <Table
              columns={fscColumns}
              data={filteredData}
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={(page) => {
                fetchFsc(page, pagination.limit);
              }}
              onEdit={(item) => {
                setSelectedFsc({
                  _id: item._id,
                  customerId: item.customerId,
                  fromDate: item.rawFromDate,
                  toDate: item.rawToDate,
                  percentage: item.rawPercentage,
                });
                setEditModalOpen(true);
              }}
              onDelete={(item) => handleDelete(item)}
              minWidth="min-w-[900px]"
            />
          )}
        </div>
      </div>

      <CreateFscModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedFsc(null);
        }}
        isEdit
        editData={selectedFsc}
        onSuccess={handleUpdateSuccess}
      />

      <CreateFscModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
        onApply={setSelectedDate}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
      />
    </div>
  );
};

export default FscPage;