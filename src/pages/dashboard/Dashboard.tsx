import { useEffect, useState } from "react";
import { Calendar1, GripVertical } from "lucide-react";
import type { Dayjs } from "dayjs";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard";
import DashboardQuickView from "../../components/dashboard/DashboardQuickView";
import RevenueChart from "../../components/dashboard/RevenueChart";
import ShipmentOverview from "../../components/dashboard/ShipmentOverview";
import truck_fast_outline from "../../assets/icons/truck_fast_outline.svg";
import truck from "../../assets/icons/heroicons_truck.svg";
import box from "../../assets/icons/solar_box.svg";
import box2 from "../../assets/icons/proicons_box.svg";
import CalendarModal from "../../components/common/modal/CalendorModal";
import LoadsDetailsModal from "../../components/dashboard/modal/LoadsDetailsModal";
import TrucksInTransitModal from "../../components/dashboard/modal/TrucksInTransitModal";
import TrucksDispatchedModal from "../../components/dashboard/modal/TrucksDispatchedModal";
import LoadsRemainingModal from "../../components/dashboard/modal/LoadsRemainingModal";
import LiveShipmentTrackingModal from "../../components/dashboard/modal/LiveShipmentTrackingModal";
import NextInQueueModal from "../../components/dashboard/modal/NextInQueueModal";
import { Reorder } from "framer-motion";
import TrackingSection from "../../components/dashboard/TrackingSection";
import { getDispatcherDashboardApi } from "../../services/auth.service";
import type { DispatcherDashboard } from "../../types/auth.types";

// KPI type -> icon/label mapping. Values/change/chart-bars come from the API's kpiTrends.
const statMeta = [
  {
    type: "loads-dispatched",
    key: "loadsDispatchedToday" as const,
    title: "Loads Dispatched Today",
    icon: box,
  },
  {
    type: "loads-remaining",
    key: "loadsRemainingToday" as const,
    title: "Loads Remaining Today",
    icon: box2,
  },
  {
    type: "trucks-transit",
    key: "trucksInTransit" as const,
    title: "Trucks in Transit",
    icon: truck,
  },
  {
    type: "trucks-dispatched",
    key: "trucksDispatched" as const,
    title: "Trucks Dispatched",
    icon: truck_fast_outline,
  },
];

type DriverCardData = {
  name: string;
  truckId: string;
  avatar: string;
  subcontractor: string;
  status: string;
  eta: string;
  location: string;
  rating: number;
};

type LatLngTuple = [number, number];

type TrackingItem = {
  id: number;
  label: string;
  value: string;
  card: DriverCardData;
  map: {
    start: LatLngTuple;
    end: LatLngTuple;
    route: LatLngTuple[];
  };
};

const trackingData: TrackingItem[] = [
  {
    id: 1,
    label: "Darlee Robertson",
    value: "Darlee Robertson",
    card: {
      name: "Darlee Robertson",
      truckId: "TRK-102",
      avatar: "https://i.pravatar.cc/150?img=1",
      subcontractor: "ABC Logistics",
      status: "In Transit",
      eta: "25 mins",
      location: "Dallas, TX",
      rating: 4.8,
    },
    map: {
      start: [34.0522, -118.2437] as LatLngTuple,
      end: [34.0528, -118.2851] as LatLngTuple,
      route: [
        [34.0522, -118.2437],
        [34.0489, -118.2568],
        [34.0407, -118.2468],
        [34.0347, -118.269],
        [34.0528, -118.2851],
      ] as LatLngTuple[],
    },
  },
  {
    id: 2,
    label: "Kevin Mark",
    value: "Kevin Mark",
    card: {
      name: "Kevin Mark",
      truckId: "TRK-205",
      avatar: "https://i.pravatar.cc/150?img=2",
      subcontractor: "Prime Transport",
      status: "Loading",
      eta: "10 mins",
      location: "Houston, TX",
      rating: 4.6,
    },
    map: {
      start: [29.7604, -95.3698] as LatLngTuple,
      end: [29.746, -95.39] as LatLngTuple,
      route: [
        [29.7604, -95.3698],
        [29.756, -95.375],
        [29.752, -95.381],
        [29.746, -95.39],
      ] as LatLngTuple[],
    },
  },
];

const DEFAULT_SECTIONS = ["quick-view", "analytics", "tracking"];

const Dashboard = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [sections, setSections] = useState<string[]>(() => {
    const saved = localStorage.getItem("dashboard-sections");
    return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
  });

  useEffect(() => {
    localStorage.setItem("dashboard-sections", JSON.stringify(sections));
  }, [sections]);

  const [selectedDate, setSelectedDate] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [isLiveTrackingModalOpen, setIsLiveTrackingModalOpen] = useState(false);
  const [isNextModalOpen, setIsNextModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(trackingData[0].value);

  const [dashboardData, setDashboardData] = useState<DispatcherDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDispatcherDashboardApi();
      setDashboardData(res.data);
    } catch {
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const currentDriver =
    trackingData.find((d) => d.value === selectedDriver) ?? trackingData[0];

  const handleNextModalOpen = () => {
    setIsNextModalOpen(true);
    setSelectedStat(null);
  };

  const handleNextModalClose = () => {
    setIsNextModalOpen(false);
    setSelectedStat("trucks-transit");
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

  // KPI trend ke daily series ko mini bar-chart heights (px) me convert karte hain
  const seriesToBars = (series: { value: number }[]) => {
    const max = Math.max(...series.map((s) => s.value), 1);
    return series.map((s) => Math.max((s.value / max) * 44, 4));
  };

const dashboardStats = statMeta.map((meta) => {
  const trend = dashboardData?.kpiTrends?.[meta.key];

  return {
    type: meta.type,
    title: meta.title,
    icon: meta.icon,

    // Top-level API value
    value: dashboardData?.[meta.key] ?? 0,

    // Trend data
    change: `${(trend?.changePct ?? 0) >= 0 ? "+" : ""}${trend?.changePct ?? 0}%`,
    positive: (trend?.changePct ?? 0) >= 0,
    chartBars: trend ? seriesToBars(trend.series) : [4, 4, 4, 4, 4, 4, 4],
  };
});

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap gap-3 lg:items-center lg:justify-between">
        <h1 className="text-base md:text-xl 2xl:text-2xl font-semibold text-(--color-text-black) font-primary">
          Dispatch Dashboard
        </h1>

        <button
          onClick={() => setIsCalendarOpen(true)}
          className="bg-white border border-(--border-gray-2) rounded-[5px] px-2 xl:px-4 py-1 xl:py-2 flex items-center gap-3 cursor-pointer w-fit ml-auto"
        >
          <Calendar1 size={16} />
          <span className="text-sm font-normal">{formatDateRange()}</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className=" grid gap-2 md:gap-3 grid-cols-2 lg:grid-cols-4">
        {loading
          ? statMeta.map((meta) => (
              <div
                key={meta.type}
                className="bg-white rounded-[5px] border border-(--border-gray-2) shadow-xs min-h-[130px] animate-pulse"
              />
            ))
          : dashboardStats.map((item) => (
              <DashboardStatCard
                key={item.title}
                {...item}
                onClick={() => setSelectedStat(item.type)}
              />
            ))}
      </div>

      <Reorder.Group
        axis="y"
        values={sections}
        onReorder={setSections}
        className="space-y-3"
      >
        {sections.map((section) => (
          <Reorder.Item
            key={section}
            value={section}
            className="relative"
            whileDrag={{ scale: 1.02 }}
          >
            <div className="absolute top-5 left-0 z-20 cursor-grab">
              <GripVertical size={18} />
            </div>
            {section === "quick-view" && (
              <DashboardQuickView
                selectedDate={selectedDate}
                driverPerformance={dashboardData?.driverPerformance ?? []}
                loading={loading}
              />
            )}

            {section === "analytics" && (
              <div className="flex xl:flex-row flex-col gap-3">
                <div className="flex-1 xl:max-w-[60%]">
                  <RevenueChart
                    revenueSummary={dashboardData?.revenueSummary ?? null}
                    loading={loading}
                  />
                </div>

               <div className="flex-1 xl:max-w-[40%]">
                 <ShipmentOverview
                  shipmentsByCustomer={dashboardData?.shipmentsByCustomer ?? []}
                  loading={loading}
                />
               </div>
              </div>
            )}

            {section === "tracking" && (
              <TrackingSection
                trackingData={trackingData}
                currentDriver={currentDriver}
                selectedDriver={selectedDriver}
                setSelectedDriver={setSelectedDriver}
              />
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={setSelectedDate}
      />

      <LoadsDetailsModal
        isOpen={selectedStat === "loads-dispatched"}
        onClose={() => setSelectedStat(null)}
        title={
          statMeta.find((stat) => stat.type === "loads-dispatched")?.title
        }
      />

      <LoadsRemainingModal
        isOpen={selectedStat === "loads-remaining"}
        onClose={() => setSelectedStat(null)}
      />

      <TrucksInTransitModal
        isOpen={selectedStat === "trucks-transit"}
        onClose={() => setSelectedStat(null)}
        handleNextModalOpen={handleNextModalOpen}
      />

      <NextInQueueModal
        isOpen={isNextModalOpen}
        onClose={handleNextModalClose}
      />

      <TrucksDispatchedModal
        isOpen={selectedStat === "trucks-dispatched"}
        onClose={() => setSelectedStat(null)}
        onRowClicked={() => setIsLiveTrackingModalOpen(true)}
      />

      <LiveShipmentTrackingModal
        isOpen={isLiveTrackingModalOpen}
        onClose={() => setIsLiveTrackingModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;