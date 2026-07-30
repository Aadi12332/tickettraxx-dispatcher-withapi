import { useState, useMemo } from "react";
import { Calendar1, Funnel, Search } from "lucide-react";
// import TableFilters from "../common/TableFilters";
import Table from "../common/Table";
import CalendarModal from "../common/modal/CalendorModal";
import CommonFilterDropdown from "../common/CommonFilterDropdown";
import SortAscending from "../../assets/icons/sortAscending.svg";

export const statementColumns = [
  {
    label: "Ticket No.",
    key: "ticketNo",
  },
  {
    label: "Date",
    key: "date",
  },
  {
    label: "Alias/Unit",
    key: "aliasUnit",
  },
  {
    label: "Driver",
    key: "driver",
  },
  {
    label: "Pickup",
    key: "pickup",
  },
  {
    label: "Drop-off",
    key: "dropOff",
  },
  {
    label: "Material",
    key: "material",
  },
  {
    label: "Tonage",
    key: "tonage",
  },
  {
    label: "Rate",
    key: "rate",
  },
  {
    label: "FSC",
    key: "fsc",
  },
  {
    label: "Gross",
    key: "gross",
  },
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
  {
    label: "Action",
    key: "ticketAction",
    sortable: false,
  },
];

export const contractorStatementData = [
  {
    id: 1,
    ticketNo: "#653783",
    date: "06/01/2026",
    aliasUnit: "0952",
    driver: "Terry Bothman",
    pickup: "Hanson Lake",
    dropOff: "LMC",
    material: "Fine Sand",
    tonage: "27.69",
    rate: "$304.59",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 2,
    ticketNo: "#682497",
    date: "15/01/2026",
    aliasUnit: "0650",
    driver: "Emery Workman",
    pickup: "Hanson Lake",
    dropOff: "LMC",
    material: "Crushed Granite",
    tonage: "28.32",
    rate: "$311.52",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Pending",
    invoiceStatus: "Pending",
    settlementStatus: "Pending",
  },
  {
    id: 3,
    ticketNo: "#598246",
    date: "25/01/2026",
    aliasUnit: "0658",
    driver: "Roger Dokidis",
    pickup: "Hanson Lake",
    dropOff: "LMC",
    material: "River Pebbles",
    tonage: "27.45",
    rate: "$301.95",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 4,
    ticketNo: "#546892",
    date: "02/02/2026",
    aliasUnit: "0485",
    driver: "Mira Dorwart",
    pickup: "Hanson Lake",
    dropOff: "LMC",
    material: "Limestone",
    tonage: "26.43",
    rate: "$290.73",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 5,
    ticketNo: "#598246",
    date: "04/02/2026",
    aliasUnit: "0125",
    driver: "James Bergson",
    pickup: "LMC",
    dropOff: "Hanson BP",
    material: "Basalt Chips",
    tonage: "25.51",
    rate: "$186.50",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 6,
    ticketNo: "#516498",
    date: "08/02/2026",
    aliasUnit: "0478",
    driver: "Hanna Mango",
    pickup: "Hanson Lake",
    dropOff: "LMC",
    material: "Slate Shingles",
    tonage: "26.59",
    rate: "$220.30",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 7,
    ticketNo: "#112546",
    date: "20/02/2026",
    aliasUnit: "0178",
    driver: "Erin Carder",
    pickup: "LMC",
    dropOff: "Hanson Lake",
    material: "Coarse Sand",
    tonage: "20.50",
    rate: "$165.50",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
  {
    id: 8,
    ticketNo: "#112547",
    date: "20/02/2026",
    aliasUnit: "0597",
    driver: "Jordyn Korsgaard",
    pickup: "LMC",
    dropOff: "Hanson Lake",
    material: "Concrete",
    tonage: "20.50",
    rate: "$165.50",
    fsc: "5.00%",
    gross: "5.00%",
    ticketStatus: "Approved",
    invoiceStatus: "Approved",
    settlementStatus: "Approved",
  },
];
const TicketsTab = () => {
  // const [search, setSearch] = useState("");
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const filteredTickets = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return contractorStatementData;

    return contractorStatementData.filter((item) =>
      [
        item.ticketNo,
        item.date,
        item.aliasUnit,
        item.driver,
        item.pickup,
        item.dropOff,
        item.material,
        item.tonage,
        item.rate,
        item.fsc,
        item.gross,
        item.ticketStatus,
        item.invoiceStatus,
        item.settlementStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [search]);
  return (
    <div className="">
      <div className="mt-[px] w-full p-4 border-b border-(--border-gray-2)">
        <h1 className="text-base  font-semibold py-2">Tickets</h1>
      </div>
      <div className="p-4 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left */}
          <p className="font-semibold text-sm ml-1">Total Tickets : 10</p>

          {/* Right */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Date */}
            <button
              onClick={() => {
                setOpenCalendarModal(true);
              }}
              className="h-[36px] px-3 border border-(--border-gray-2) rounded-[4px] min-w-fit sm:text-sm text-xs flex items-center gap-2 cursor-pointer"
            >
              <Calendar1 size={18} />
              <span>{"15/05/2026 - 21/05/2026"}</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-text-gray"
              />

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
              onChange={setFilter}
              icon={<Funnel size={16} />}
              options={[
                { label: "30 Days", value: "30" },
                { label: "90 Days", value: "90" },
                { label: "180 Days", value: "180" },
                { label: "365 Days", value: "365" },
              ]}
            />
            <CommonFilterDropdown
              title="Sort By"
              value={sort}
              onChange={setSort}
              icon={<img src={SortAscending} alt="sort" className="size-5" />}
              options={[
                { label: "All", value: "" },
                { label: "Ticket", value: "ticket" },
              ]}
            />
          </div>
          <div className="overflow-x-auto">
            <div className="">
              <Table
                columns={statementColumns}
                data={filteredTickets}
                onEdit={(item) => console.log("Edit Material:", item)}
                onDelete={(item) => console.log("Delete Material:", item)}
                minWidth="min-w-[1800px]"
              />
            </div>
          </div>
        </div>
      </div>
      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
      />
    </div>
  );
};

export default TicketsTab;
