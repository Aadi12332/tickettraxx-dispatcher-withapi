import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Table from "../common/Table";
export const amountPaidData = [
  {
    id: 1,
    jobId: "#280099",
    date: "23/01/2026",
    driver: "Andrew Brooks",
    amountPaid: "$3200.00",
  },
  {
    id: 2,
    jobId: "#280798",
    date: "10/02/2026",
    driver: "Andrew Brooks",
    amountPaid: "$3200.00",
  },
  {
    id: 3,
    jobId: "#280798",
    date: "10/02/2026",
    driver: "Mark Lucas",
    amountPaid: "$3200.00",
  },
  {
    id: 4,
    jobId: "#280798",
    date: "10/02/2026",
    driver: "Mark Lucas",
    amountPaid: "$2500.00",
  },
  {
    id: 5,
    jobId: "#280692",
    date: "10/02/2026",
    driver: "Mark Lucas",
    amountPaid: "$2500.00",
  },
  {
    id: 6,
    jobId: "#280692",
    date: "10/02/2026",
    driver: "Mark Lucas",
    amountPaid: "$2500.00",
  },
  {
    id: 7,
    jobId: "#280692",
    date: "10/02/2026",
    driver: "John Drake",
    amountPaid: "$2500.00",
  },
  {
    id: 8,
    jobId: "#280692",
    date: "08/01/2026",
    driver: "John Drake",
    amountPaid: "$4200.00",
  },
];

export const amountPaidColumns = [
  {
    label: "Job ID",
    key: "jobId",
    textColor:"#1D3461"
  },
  {
    label: "Date",
    key: "date",
  },
  {
    label: "Driver",
    key: "driver",
  },
  {
    label: "Amount Paid",
    key: "amountPaid",
  },
];

const AmountPaidTab = () => {
  const [search, setSearch] = useState("");

const filteredData = useMemo(() => {
  const value = search.toLowerCase().trim();

  if (!value) return amountPaidData;

  return amountPaidData.filter((item) =>
    Object.values(item).some((field) =>
      String(field).toLowerCase().includes(value)
    )
  );
}, [search]);
  return (
    <div className="border border-[#E5E7EB]">
      <div className="flex items-center justify-between gap-3 p-2 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
            Amount Paid
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-t border-[#E5E7EB] pt-5 px-2 sm:px-4">
        <p className="text-sm sm:text-base font-medium text-[#1B2D6B]">
          Total Amount Paid : $32000.00
        </p>
        <div className="relative w-full sm:w-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 pl-9 pr-4 h-9 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#233B73] bg-white"
          />
        </div>
      </div>

      <div className="p-4">
        <Table data={filteredData} columns={amountPaidColumns} isCheckbox={false} minWidth="min-w-[800px]" />
      </div>
    </div>
  );
};

export default AmountPaidTab;
