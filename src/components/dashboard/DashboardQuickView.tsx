import { SlidersHorizontal } from "lucide-react";
import SectionTitle from "../common/SectionTitle";
import { useState } from "react";
import type { Dayjs } from "dayjs";
import LiveShipmentTrackingModal from "./modal/LiveShipmentTrackingModal";
import CommonFilterDropdown from "../common/CommonFilterDropdown";
import { getInitials } from "../../hooks/useAuth";
import type { DriverPerformance } from "../../types/auth.types";

interface DashboardQuickViewProps {
  selectedDate?: [Dayjs | null, Dayjs | null];
  driverPerformance: DriverPerformance[];
  loading?: boolean;
}

const DriverRow = ({
  driver,
  onDriverClick,
}: {
  driver: DriverPerformance;
  onDriverClick: () => void;
}) => {
  return (
    <tr className="border-b border-gray-100 last:border-none font-archivo">
      <td className="py-2 px-3 font-archivo">
        <div className="flex items-center gap-3">
          <div
            onClick={onDriverClick}
            className="w-8 h-8 rounded-full bg-sky-blue flex items-center justify-center text-white text-[10px] font-semibold cursor-pointer shrink-0"
          >
            {getInitials(driver.name)}
          </div>
          <span
            className="text-sm font-medium text-black font-archivo cursor-pointer hover:underline"
            onClick={onDriverClick}
          >
            {driver.name}
          </span>
        </div>
      </td>

      <td className="py-5 text-sm text-black  font-archivo">{driver.completedTrips}</td>

      <td className="py-5 text-sm text-black  font-archivo">
        {driver.remainingLoads}
      </td>

      <td className="py-5 text-sm text-text-secondary  font-archivo">
        {driver.onTimePct}%
      </td>

      <td className="py-5 text-sm text-text-secondary  font-archivo">
        ${driver.revenue.toLocaleString()}
      </td>

      <td className="py-5">
       <div className="flex items-center gap-2 text-text-secondary font-archivo text-sm">
  {driver.rating != null ? `⭐ ${driver.rating}` : "-"}
</div>
      </td>
    </tr>
  );
};

const DashboardQuickView = ({
  driverPerformance,
  loading = false,
}: DashboardQuickViewProps) => {
  const [isLiveTrackingModalOpen, setIsLiveTrackingModalOpen] = useState(false);
  const [completionSort, setCompletionSort] = useState("");

  // Note: API driverPerformance me rating field nahi aati — rating column/sort hata diya hai
  const sortedDrivers = [...driverPerformance].sort((a, b) => {
    if (completionSort === "low_to_high") {
      return a.onTimePct - b.onTimePct;
    }

    if (completionSort === "high_to_low") {
      return b.onTimePct - a.onTimePct;
    }

    return 0;
  });

  return (
    <div className="bg-white rounded-[5px] border border-(--border-gray-2) overflow-hidden shadow-sm">
      {/* Header */}

      <div className="px-5 py-2 sm:py-3 flex-wrap gap-3 flex items-center justify-between border-b border-(--border-gray-2)">
        <SectionTitle
          title={"Dispatch Dashboard Quick View"}
          className="text-sm sm:text-[18px]"
        />

        <div className="flex items-center gap-1 sm:gap-4">
          <CommonFilterDropdown
            value={completionSort}
            onChange={setCompletionSort}
            icon={!completionSort ? <SlidersHorizontal size={18} /> : null}
            options={[
              { label: "Default", value: "" },
              { label: "Low to High Completion %", value: "low_to_high" },
              { label: "High to Low Completion %", value: "high_to_low" },
            ]}
            size="auto"
          />
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-(--border-gray-2) h-[36px]">
              <th className="text-left px-2 xl:px-5 text-xs sm:text-sm font-semibold text-black font-archivo">
                Drivers Name
              </th>

              <th className="text-left text-xs sm:text-sm font-semibold text-black font-archivo">
                Completed Trips
              </th>

              <th className="text-left text-xs sm:text-sm font-semibold text-black font-archivo">
                Remaining Loads
              </th>

              <th className="text-left text-xs sm:text-sm font-semibold text-black font-archivo">
                On-Time %
              </th>

              <th className="text-left text-xs sm:text-sm font-semibold text-black font-archivo">
                Revenue
              </th>

              <th className="text-left text-xs sm:text-sm font-semibold text-black font-archivo">
                Rating
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-text-secondary">
                  Loading...
                </td>
              </tr>
            ) : sortedDrivers.length > 0 ? (
              sortedDrivers.map((driver) => (
                <DriverRow
                  key={driver.driverId}
                  driver={driver}
                  onDriverClick={() => setIsLiveTrackingModalOpen(true)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-text-secondary">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LiveShipmentTrackingModal
        isOpen={isLiveTrackingModalOpen}
        onClose={() => setIsLiveTrackingModalOpen(false)}
      />
    </div>
  );
};

export default DashboardQuickView;