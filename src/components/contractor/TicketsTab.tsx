import { useState, useEffect, useCallback } from "react";
import { Calendar1, Funnel, Search } from "lucide-react";
import dayjs from "dayjs";
import Table from "../common/Table";
import CalendarModal from "../common/modal/CalendorModal";
import CommonFilterDropdown from "../common/CommonFilterDropdown";
import SortAscending from "../../assets/icons/sortAscending.svg";
import { getTicketsApi } from "../../services/auth.service";
import type { Ticket } from "../../types/auth.types";

export const statementColumns = [
  { label: "Ticket No.", key: "ticketNo" },
  { label: "Date", key: "date" },
  { label: "Alias/Unit", key: "aliasUnit" },
  { label: "Driver", key: "driver" },
  { label: "Pickup", key: "pickup" },
  { label: "Drop-off", key: "dropOff" },
  { label: "Material", key: "material" },
  { label: "Tonage", key: "tonage" },
  { label: "Invoice Rate", key: "invoiceRate" },
  { label: "Contractor Rate", key: "contractorRate" },
  { label: "FSC", key: "fsc" },
  { label: "Gross", key: "gross" },
  {
    label: "Ticket Status",
    width: "120px",
    key: "ticketStatus",
    render: (item: any) => (
      <span
        className={`px-3 py-2 rounded-[4px] text-white text-[14px] font-medium ${
          item.ticketStatus === "Approved" ? "bg-[#22C55E]" : "bg-[#EAB308]"
        }`}
      >
        {item.ticketStatus}
      </span>
    ),
  },
  {
    label: "Invoice Status",
    width: "120px",
    key: "invoiceStatus",
    render: (item: any) => (
      <span
        className={`px-3 py-2 rounded-[4px] text-white text-[14px] font-medium ${
          item.invoiceStatus === "Approved" ? "bg-[#22C55E]" : "bg-[#EAB308]"
        }`}
      >
        {item.invoiceStatus}
      </span>
    ),
  },
  {
    label: "Settlement Status",
    width: "150px",
    key: "settlementStatus",
    render: (item: any) => (
      <span
        className={`px-3 py-2 rounded-[4px] text-white text-[14px] font-medium ${
          item.settlementStatus === "Approved" ? "bg-[#22C55E]" : "bg-[#EAB308]"
        }`}
      >
        {item.settlementStatus}
      </span>
    ),
  },
  { label: "Action", key: "ticketAction", sortable: false, minWidth: "100px" },
];

const TicketsTab = ({ contractorId }: { contractorId?: string }) => {
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(
    async (opts?: { page?: number }) => {
      if (!contractorId) return;
      setLoading(true);
      setError(null);
      try {
        // build params with multiple common keys to be robust against backend expectations
        const params: any = {
          contractorId,
          page: opts?.page ?? pagination.page,
          limit: pagination.limit,
          // send both 'search' and 'q' to match backend variants
          search: search || undefined,
          q: search || undefined,
          // send both approvalStatus and status
          approvalStatus: filter || undefined,
          status: filter || undefined,
          billingStatus: undefined,
          // include sort as-is
          sort: sort || undefined,
        };

        // include both from/to and fromDate/toDate variants in YYYY-MM-DD
        if (startDate) {
          const fd = dayjs(startDate).format("YYYY-MM-DD");
          params.fromDate = fd;
          params.from = fd;
        }
        if (endDate) {
          const td = dayjs(endDate).format("YYYY-MM-DD");
          params.toDate = td;
          params.to = td;
        }

        const res = await getTicketsApi(params);

        setTickets(res.data || []);
        setPagination((p) => ({
          ...p,
          total: res.pagination?.total ?? res.data.length,
          page: res.pagination?.page ?? (opts?.page ?? p.page),
        }));
      } catch (err) {
        console.error(err);
        setError("Unable to load tickets");
      } finally {
        setLoading(false);
      }
    },
    [contractorId, search, startDate, endDate, filter, pagination.limit, sort],
  );

  // Fetch when relevant filters change
  useEffect(() => {
    const t = setTimeout(() => fetchTickets({ page: 1 }), 300);
    return () => clearTimeout(t);
  }, [fetchTickets]);

  const mapped = tickets.map((t) => ({
    id: t._id,
    ticketNo: t.ticketNo ?? "-",
    date: t.date ? dayjs(t.date).format("DD MMM YYYY") : "-",
    aliasUnit: typeof t.tripId?.truckId === 'object' ? (t.tripId?.truckId?.unitNumber ?? "-") : (t.tripId?.truckId ?? "-"),
    driver: t.driverId?.name ?? "-",
    pickup: t.pickupSiteId?.name ?? "-",
    dropOff: t.dropSiteId?.name ?? "-",
    material: t.materialId?.name ?? "-",
    tonage: t.tonnage ?? "-",
    invoiceRate: t.invoiceRate ? `$${t.invoiceRate}` : "-",
    contractorRate: t.contractorRate ? `$${t.contractorRate}` : "-",
    fsc: t.fscPct ? `${t.fscPct}%` : "-",
    gross: t.amount ? `$${t.amount}` : "-",
    ticketStatus: t.approvalStatus ?? "-",
    invoiceStatus: t.billingStatus ?? "-",
    settlementStatus: t.statementId?.status ?? "-",
    ticketAction: null,
  }));

  return (
    <div className="">
      <div className="mt-[px] w-full p-4 border-b border-(--border-gray-2)">
        <h1 className="text-base  font-semibold py-2">Tickets</h1>
      </div>

      <div className="p-4 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left */}
          <p className="font-semibold text-sm ml-1">Total Tickets : {pagination.total}</p>

          {/* Right */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Date */}
            <button
              onClick={() => setOpenCalendarModal(true)}
              className="h-[36px] px-3 border border-(--border-gray-2) rounded-[4px] min-w-fit sm:text-sm text-xs flex items-center gap-2 cursor-pointer"
            >
              <Calendar1 size={18} />
              <span>
                {startDate && endDate
                  ? `${dayjs(startDate).format("DD/MM/YYYY")} - ${dayjs(endDate).format("DD/MM/YYYY")}`
                  : "All Dates"}
              </span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-gray" />

              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-[36px] sm:w-[180px] w-[120px] border border-(--border-gray-2) rounded-[4px] pl-8 pr-4 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="px-0 py-4 pb-0 space-y-3">
          <div className="flex gap-2 sm:justify-between flex-wrap">
            <CommonFilterDropdown
              title="Filter"
              value={filter}
              onChange={(v: string) => setFilter(v)}
              icon={<Funnel size={16} />}
              options={[
                { label: "All", value: "" },
                { label: "Approved", value: "Approved" },
                { label: "Pending", value: "PendingApproval" },
                { label: "Under Review", value: "UnderReview" },
                { label: "Rejected", value: "Rejected" },
              ]}
            />

            <CommonFilterDropdown
              title="Sort By"
              value={sort}
              onChange={(v: string) => setSort(v)}
              icon={<img src={SortAscending} alt="sort" className="size-5" />}
              options={[{ label: "Date Desc", value: "date_desc" }, { label: "Date Asc", value: "date_asc" }]}
            />
          </div>

          <div className="overflow-x-auto">
            <div className="">
              {loading ? (
                <p className="text-sm text-[#6B7280]">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <Table columns={statementColumns} data={mapped} minWidth="min-w-[1800px]" />
              )}
            </div>
          </div>
        </div>
      </div>

      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
        onApply={(range) => {
          const [s, e] = range;
        setStartDate(s ? dayjs(s).startOf("day").format("YYYY-MM-DD") : undefined);
        setEndDate(e ? dayjs(e).endOf("day").format("YYYY-MM-DD") : undefined);
        }}
      />
    </div>
  );
};

export default TicketsTab;
