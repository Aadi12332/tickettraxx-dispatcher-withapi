import { Search } from "lucide-react";
import CommonButton from "../common/CommonButton";
import Table from "../common/Table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ContractorDriver } from "../../types/auth.types";

const driverColumns = [
  { label: "Name", key: "name" },
  { label: "Jobs", key: "jobs" },
  { label: "Truck ID", key: "truckId" },
  {
    label: "Payment",
    key: "payment",
    render: (item: any) => (
      <div>
        <span className="text-[#233B73] font-semibold block leading-tight">
          {item.payment}
        </span>
        <span className="text-[#9CA3AF] text-xs">{item.paymentSub}</span>
      </div>
    ),
  },
];

interface DriverSectionProps {
  drivers?: ContractorDriver[];
  loading?: boolean;
  contractorId?: string;
}

// Dummy fallback jab tak contractor detail API se real drivers na aayein
const dummyDrivers = [
  {
    id: 1,
    name: "David Brooks",
    jobs: 18,
    truckId: "12343",
    payment: "$120",
    paymentSub: "Per Hour",
  },
  {
    id: 2,
    name: "Drake Antony",
    jobs: 21,
    truckId: "12343",
    payment: "$120",
    paymentSub: "08:20:13 PM",
  },
  {
    id: 3,
    name: "Jake Sully",
    jobs: 22,
    truckId: "12343",
    payment: "$120",
    paymentSub: "04:10:12 PM",
  },
  {
    id: 4,
    name: "David Jobs",
    jobs: 15,
    truckId: "12345",
    payment: "$120",
    paymentSub: "03:40:14 PM",
  },
  {
    id: 5,
    name: "Charles Frank",
    jobs: 12,
    truckId: "232423",
    payment: "$120",
    paymentSub: "05:00:14 PM",
  },
];

const DriverSection = ({
  drivers,
  loading = false,
  contractorId,
}: DriverSectionProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Real API data ho to usi se row banao, warna dummy
  const rows = drivers
    ? drivers.map((d) => ({
        id: d._id,
        name: d.name,
        jobs: d.jobsCount,
        truckId: d.unitNumber || "-",
        payment: d.payPercent !== undefined ? `${d.payPercent}%` : "-",
        paymentSub: "Pay Percent",
      }))
    : dummyDrivers;

  const filteredDrivers = rows.filter((driver) => {
    const value = search.toLowerCase();

    return (
      driver.name.toLowerCase().includes(value) ||
      driver.jobs.toString().includes(value) ||
      driver.truckId.toLowerCase().includes(value) ||
      driver.payment.toLowerCase().includes(value) ||
      driver.paymentSub.toLowerCase().includes(value)
    );
  });

  return (
    <div className="border border-[#E5E7EB]">
      <div className="flex items-center justify-between gap-3 p-2 sm:p-3">
        <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
          Drivers
        </h3>
        <CommonButton
          variant="primary"
          size="sm"
          onClick={() =>
            navigate("/contractors/add-driver", { state: { contractorId } })
          }
        >
          Add Driver
        </CommonButton>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-t border-[#E5E7EB] pt-5 px-2 sm:px-4">
        <p className="text-sm sm:text-base font-medium text-[#1B2D6B]">
          Total No of Driver : {rows.length}
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

      {loading ? (
        <p className="text-sm text-[#6B7280] py-6 text-center">Loading drivers...</p>
      ) : (
        <div className="p-4">
          <Table data={filteredDrivers} columns={driverColumns} isCheckbox={false} minWidth="min-w-[600px]" />
        </div>
      )}
    </div>
  );
};

export default DriverSection;