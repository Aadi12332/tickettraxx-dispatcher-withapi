import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../common/Table";
import CommonButton from "../common/CommonButton";
import type { ContractorTruck, ContractorDriver } from "../../types/auth.types";

export const truckDetailsColumns = [
  {
    label: "Truck ID",
    key: "truckId",
  },
  {
    label: "Driver",
    key: "driver",
  },
  {
    label: "Truck Type",
    key: "truckType",
  },
  {
    label: "License Plate",
    key: "licensePlate",
  },
  {
    label: "Capacity",
    key: "capacity",
  },
];

// Dummy fallback jab tak contractor detail API se real trucks na aayein
const dummyTrucks = [
  {
    id: 1,
    truckId: "#280099",
    driver: "Andrew Brooks",
    truckType: "Paver",
    licensePlate: "ABC1234",
    capacity: "30 Tons",
  },
  {
    id: 2,
    truckId: "#280099",
    driver: "Andrew Brooks",
    truckType: "Dump Truck",
    licensePlate: "XYZ5678",
    capacity: "20 Tons",
  },
  {
    id: 3,
    truckId: "#280099",
    driver: "John Drake",
    truckType: "Paver",
    licensePlate: "LMN9101",
    capacity: "20 Tons",
  },
];

interface TruckDetailsTabProps {
  trucks?: ContractorTruck[];
  drivers?: ContractorDriver[];
  loading?: boolean;
}

const TruckDetailsTab = ({ trucks, drivers, loading = false }: TruckDetailsTabProps) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Real API data ho to usi se row banao (driver naam assignedDriverId se lookup karke),
  // truckType/licensePlate/capacity API me nahi aate isliye dummy rehta hai
  const rows = trucks
    ? trucks.map((t) => ({
        id: t._id,
        truckId: t.unitNumber,
        driver: drivers?.find((d) => d._id === t.assignedDriverId)?.name || "-",
        truckType: "-",
        licensePlate: "-",
        capacity: "-",
      }))
    : dummyTrucks;

  const filteredData = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return rows;

    return rows.filter((item) =>
      Object.values(item).some((field) =>
        String(field).toLowerCase().includes(value)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, rows]);

  return (
    <div className="border border-[#E5E7EB]">
      <div className="flex items-center justify-between gap-3 p-2 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
          Truck Details
        </h3>

        <CommonButton size="sm" variant="primary" onClick={() => navigate("/contractors/add-truck")}>
          Add Truck
        </CommonButton>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-t border-[#E5E7EB] pt-5 px-2 sm:px-4">
        <p className="text-sm sm:text-base font-medium text-[#1B2D6B]">
          Total Trucks : {rows.length}
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
        <p className="text-sm text-[#6B7280] py-6 text-center">Loading trucks...</p>
      ) : (
        <Table
          data={filteredData}
          columns={truckDetailsColumns}
          isCheckbox={false}
          minWidth="min-w-[600px]"
        />
      )}
    </div>
  );
};

export default TruckDetailsTab;