import { useEffect, useState } from "react";
import { Calendar1 } from "lucide-react";
import dayjs from "dayjs";
import SectionTitle from "../common/SectionTitle";
import CalendarModal from "../common/modal/CalendorModal";
import CommonFilterDropdown from "../common/CommonFilterDropdown";
import CommonButton from "../common/CommonButton";
import { getCustomersApi } from "../../services/auth.service";
import type { ShipmentByCustomer } from "../../types/auth.types";

interface ShipmentOverviewProps {
  shipmentsByCustomer: ShipmentByCustomer[];
  loading?: boolean;
}

export default function ShipmentOverview({
  shipmentsByCustomer,
  loading = false,
}: ShipmentOverviewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

  // Customer filter dropdown ab real customers API se aata hai (pehle static poCustomerOptions tha)
  const [customerOptions, setCustomerOptions] = useState<
    { label: string; value: string }[]
  >([{ label: "All", value: "All" }]);
  const [selectedCustomer, setSelectedCustomer] = useState("All");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await getCustomersApi();
        setCustomerOptions([
          { label: "All", value: "All" },
          ...res.data.map((c) => ({ label: c.name, value: c._id })),
        ]);
      } catch {
        // customer list fetch fail ho to bhi "All" option kaam karta rahega
      }
    };
    fetchCustomers();
  }, []);

  const filteredShipments =
    selectedCustomer === "All"
      ? shipmentsByCustomer
      : shipmentsByCustomer.filter((s) => s.customerId === selectedCustomer);

  const maxCount = Math.max(...filteredShipments.map((s) => s.count), 1);
  const top2Ids = [...filteredShipments]
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((s) => s.customerId);

  return (
    <div className="bg-white rounded-[5px] border shadow-sm border-(--border-gray-2) pb-2">
      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-(--border-gray-2) px-5 sm:py-3 py-2">
        <SectionTitle title="Shipment Overview" />

        <div className="flex items-center xl:gap-2 gap-3 sm:ml-auto">
          <CommonFilterDropdown
            value={selectedCustomer}
            onChange={setSelectedCustomer}
            options={customerOptions}
            size="140px"
          />

          {/* Note: dashboard API abhi date-range filter accept nahi karti, isliye ye sirf date label dikhata hai */}
          <CommonButton
            onClick={() => setIsCalendarOpen(true)}
            variant="secondary"
            size="md"
          >
            <Calendar1 size={15} />
            <span className="text-xs font-normal">
              {dayjs(selectedDate).format("DD MMM YYYY")}
            </span>
          </CommonButton>
        </div>
      </div>

      <div className="flex items-end justify-between lg:h-[310px] h-[200px] mt-10 px-4 gap-2 overflow-auto pb-2">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-50" />
        ) : filteredShipments.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-[#6B7280]">
            No shipment data yet
          </div>
        ) : (
          filteredShipments.map((item) => (
            <div
              key={item.customerId}
              className="group flex flex-col items-center gap-2 relative shrink-0"
            >
              {/* Count - Hover par */}
              <div className="absolute -top-7 hidden group-hover:block bg-primary text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                {item.count}
              </div>

              {/* Top 2 bars par star */}
              {top2Ids.includes(item.customerId) && (
                <div className="absolute -top-0 text-white text-[10px]">★</div>
              )}

              <div
                className="w-3.5 rounded-full bg-text-gray hover:bg-primary cursor-pointer"
                style={{
                  height: `${Math.max((item.count / maxCount) * 180, 4)}px`,
                }}
              />

              <span className="text-gray-500 text-xs max-w-[60px] truncate text-center" title={item.name}>
                {item.name}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-3 mt-4 px-4 font-archivo">
        <span className="text-xs 2xl:text-sm text-(--text-gray)">
          {filteredShipments.reduce((acc, s) => acc + s.count, 0)} total shipments
        </span>
      </div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={(range) => {
          const [startDate] = range;

          if (startDate) {
            setSelectedDate(startDate.format("YYYY-MM-DD"));
          }

          setIsCalendarOpen(false);
        }}
      />
    </div>
  );
}