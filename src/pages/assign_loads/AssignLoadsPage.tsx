// @ts-nocheck
import { RefreshCcw } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useState, useMemo, useEffect } from "react";
import AssignLoadCard from "../../components/assign_loads/AssignLoadCard";
import DispatchAssignmentGrid from "../../components/assign_loads/DispatchAssignmentGrid";
import CancelRerouteDrawer from "../../components/assign_loads/CancelRerouteDrawer";
import DispatchDetailsModal from "../../components/assign_loads/DispatchDetailsModal";
import DispatchAssignmentGridModal from "../../components/assign_loads/DispatchAssignmentGridModal";
import UpscaleImg from "../../assets/icons/expand.svg";
import searchIcon from "../../assets/icons/searchIcon.svg";
import EditDispatchModal from "../../components/assign_loads/modal/EditDispatchModal";
import LiveShipmentTrackingModal from "../../components/dashboard/modal/LiveShipmentTrackingModal";
import CommonConfirmModal from "../../components/common/modal/CommonConfirmModal";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setRowData,
  setOriginalRowData,
  confirmSaveGridData,
  setSelectedDay,
} from "../../store/dispatchSlice";
import ToastModal from "../../components/common/modal/ToastModal";
import SuccessActionModal from "../../components/assign_loads/SuccessActionModal";
import { getAssignmentMatrixApi } from "../../services/auth.service";
import { useAssignLoad } from "./AssignLoadContext";

interface LoadCard {
  driverName: string;
  delivery: string;
  loads: number;
  rate: number;
  contractorRate: number;
  remaining: number;
  pickup: string;
  material: string;
  time: string;
  jobId?: string;
  dispatchId?: string;
  headerColor?: "yellow" | "orange";
}

export const mapMatrixColumnToCard = (item: any): LoadCard => ({
  driverName:
    typeof item.customerName === "object"
      ? item.customerName?.name
      : item.customerName,
  delivery: item.delivery,
  loads: item.loads,
  rate: item.rate,
  pickup: item.pickup,
  material: item.material,
  time: item.time,
  jobId: item.poCode,
  dispatchId: item.dispatchId,
  remaining: item.remaining,
  contractorRate: item.contractorRate,
  headerColor: item.headerColor ?? "yellow",
});

const AssignLoadsPage = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.dispatch.selectedDay);
  const rowData = useAppSelector((state) => state.dispatch.rowData);
  const originalRowData = useAppSelector(
    (state) => state.dispatch.originalRowData,
  );
  const [assignmentCards, setAssignmentCards] = useState<LoadCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const [openCancelDrawer, setOpenCancelDrawer] = useState(false);
  const [openDispatchModal, setOpenDispatchModal] = useState(false);
  const [openGridModal, setOpenGridModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null,
  );
  const [isLiveTrackingModalOpen, setIsLiveTrackingModalOpen] = useState(false);
  const [buttonStatus] = useState(false);
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  console.log(setToastTitle, showSuccessModal);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { selectedDate, setSelectedDate } = useAssignLoad();
  const [matrixData, setMatrixData] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);

  useEffect(() => {
    sessionStorage.setItem("assignLoadsDate", selectedDate);
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index)); // last 6 days + today

      const day = date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();

      return {
        label: `${day} ${date.getMonth() + 1}/${date.getDate()}`,
        value: date.toISOString().split("T")[0],
      };
    });
  }, []);

  useEffect(() => {
    const selected = weekDays.find((d) => d.value === selectedDate);

    if (selected) {
      dispatch(setSelectedDay(selected.label));
    } else {
      dispatch(setSelectedDay(""));
    }
  }, []);

  const loadAssignments = async () => {
    setCardsLoading(true);
    try {
      const res = await getAssignmentMatrixApi(selectedDate);
      console.log("Assignment Matrix API Response:", res);
      setMatrixData(res.data?.data);
      setFooter(res.data?.footer);

      setAssignmentCards(res.data?.data?.columns.map(mapMatrixColumnToCard));
      const rows = (res.data?.data?.rows ?? [])
        .filter((row: any) => {
    if (row.rowType === "contractor" || row.rowType === "driver") {
      return row.drivers?.some(
        (driver: any) =>
          driver.truckUnitNumber &&
          driver.truckUnitNumber.trim() !== ""
      );
    }

    return true;
  })
        .map((row: any, idx: number) => ({
          _rowKey: row.driverId ?? row.id ?? `row-${idx}`,
          driver: row.driver,
          truckId: Array.isArray(row.drivers)
            ? row.drivers.map((d: any) => d.truckUnitNumber)
            : [],
          drivers: Array.isArray(row.drivers)
            ? row.drivers.map((driver: any) => ({
                id: driver.id,
                name: driver.name,
                truckId: driver.truckId,
                truckUnitNumber: driver.truckUnitNumber,
              }))
            : [],
          tonnage: row.tonnage,
          total: row.total,
          status: row.status,
          weCall: row.weCall,
          driverId: row.driverId,
          contractorId: row.contractorId,
          jobs: row.jobs.map((job: any) => {
            const column = res.data?.data?.columns.find(
              (c: any) => c.id === job.id,
            );

            return {
              ...job,
              id: column?.id ?? job.id,
            };
          }),
        }));

      dispatch(setRowData(rows));
      dispatch(setOriginalRowData(JSON.parse(JSON.stringify(rows))));
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedDate]);

  const handleShowToast = (title: string) => {
    setSuccessModal({
      open: true,
      title,
    });

    setTimeout(() => {
      setSuccessModal({
        open: false,
        title: "",
      });
    }, 3000);
  };

  const handleSetRowData = (newData: any) => {
    if (typeof newData === "function") {
      dispatch(setRowData(newData(rowData)));
    } else {
      dispatch(setRowData(newData));
    }
  };

  useEffect(() => {
    if (!selectedDay) {
      handleSetRowData(rowData);
      return;
    }

    const offset = selectedDay.charCodeAt(selectedDay.length - 1) % 5;

    const newRowData = [...rowData].sort(
      (a, b) => (offset % 2 === 0 ? 1 : -1) * a.driver.localeCompare(b.driver),
    );
    handleSetRowData(newRowData);
    dispatch(setOriginalRowData(JSON.parse(JSON.stringify(newRowData))));
  }, [selectedDay]);

  const handleUpdate = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    dispatch(confirmSaveGridData());
    setShowConfirmModal(false);
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const currentLoadCards = useMemo(() => {
    return assignmentCards;
  }, [assignmentCards]);

  const hasCardData = (matrixData?.columns?.length ?? 0) > 0;
  const hasRowData =
    (matrixData?.rows?.length ?? 0) > 0 &&
    (matrixData?.columns?.length ?? 0) > 0;
  const hasAnyData = hasCardData || hasRowData;

  return (
    <div className="space-y-1 h-full">
      <PageHeader
        title="Assign Loads"
        description="Enables you to assign loads to available drivers"
      >
        <div
          className="overflow-auto cards-scroll w-[calc(100vw-32px)] lg:w-[unset]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#1D3461 #D9D9D9",
          }}
        >
          <div className="flex items-stretch gap-1 w-full md:justify-end min-w-[710px] lg:min-w-[unset]">
            {/* Left Action */}
            <button
              onClick={handleUpdate}
              className="
                h-10 px-3 gap-2 text-sm
                rounded-lg
                border border-(--border-gray-2)
                bg-white
                flex items-center justify-center
                cursor-pointer
              "
            >
              Update
              <RefreshCcw size={16} />
            </button>

            <button
              // onClick={() => setOpenGridModal(true)}
              onClick={() => setOpenDispatchModal(true)}
              className="
              h-10 w-10 min-w-10
              rounded-lg
              border border-(--border-gray-2)
              bg-white
              flex items-center justify-center
              cursor-pointer
              shrink-0
            "
            >
              <img src={UpscaleImg} className="size-[18px]" />
            </button>

            {/* Date Filter */}
            <div
              className="
              flex gap-3
              flex-wrap sm:flex-nowrap
              items-center
              rounded-lg
              border border-(--border-gray-2)
              bg-white
              px-1 sm:py-0 p-[3px]
            min-w-0
              overflow-hidden
            "
            >
              {/* Week Days */}
              <div className="flex md:flex-1 max-w-lg min-w-0 overflow-x-auto scrollbar-hide ">
                <div className="flex items-center gap-2 w-max text-xs">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        dispatch(setSelectedDay(day.label));
                        setSelectedDate(day.value);
                      }}
                      className={
                        selectedDay === day.label
                          ? "bg-sky-blue-two text-white px-1 py-0.5 rounded-lg cursor-progress"
                          : "text-[#2F2F2F]"
                      }
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Search */}
              <div className="flex items-center gap-1 ml-auto sm:ml-2 shrink-0 ">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedDate(value);

                    dispatch(setSelectedDay(""));
                  }}
                  className="
                  h-8
                  w-[120px]
                  px-2
                  text-sm
                  border border-(--border-gray-2)
                  rounded
                  outline-none
                "
                />

                <button
                  className="
                  h-8 
                  w-8 min-w-8
                  rounded
                  bg-sky-blue-two
                  flex items-center justify-center
                  text-white
                  cursor-pointer
                "
                >
                  <img src={searchIcon} alt="search" className="size-5" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setOpenGridModal(true)}
                className="
                h-10 w-10 min-w-10
                rounded-lg
                border border-(--border-gray-2)
                bg-white
                flex items-center justify-center
                cursor-pointer
              "
              >
                <img src={UpscaleImg} className="size-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </PageHeader>
      <style>{`
        .cards-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .cards-scroll::-webkit-scrollbar-track {
          background: #D9D9D9;
          border-radius: 99px;
        }
        .cards-scroll::-webkit-scrollbar-thumb {
          background: #1D3461;
          border-radius: 99px;
        }
        .cards-scroll::-webkit-scrollbar-thumb:hover {
          background: #1D3461;
        }
      `}</style>

      <div className="relative w-full mt-3">
        {!hasAnyData ? (
          <div className="flex items-center justify-center h-[450px] bg-white border rounded-lg border-gray-300">
            <p className="text-lg font-medium text-gray-500">
              No data found for the selected date.
            </p>
          </div>
        ) : (
          <>
            {hasCardData ? (
              <div className="absolute top-0 left-0 right-0 z-[80]">
                <div
                  className="cards-scroll overflow-x-auto"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#1D3461 #D9D9D9",
                  }}
                >
                  <div className="flex gap-4 min-w-max items-center pb-3 pt-0 max-w-full">
                    {cardsLoading && (
                      <p className="text-sm text-[#6B7280] px-2">Loading...</p>
                    )}

                    {currentLoadCards.map((card, index) => (
                      <AssignLoadCard
                        key={index}
                        {...card}
                        onCancelReroute={() => setOpenCancelDrawer(true)}
                        onEditDispatch={(dispatchId) => {
                          setSelectedDispatchId(dispatchId ?? null);
                          setShowEditModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center bg-white border rounded-lg border-gray-300">
                <p className="text-lg font-medium text-gray-500">
                  No card data found.
                </p>
              </div>
            )}

            {hasRowData ? (
              <div
                className={`relative z-1 w-full overflow-auto ${
                  hasCardData ? "pt-[170px]" : "pt-4"
                }`}
              >
                <DispatchAssignmentGrid
                  onOpenCancelDrawer={() => setOpenCancelDrawer(true)}
                  onRowClicked={() => setIsLiveTrackingModalOpen(true)}
                  buttonStatus={buttonStatus}
                  selectedDay={selectedDay}
                  rowData={rowData}
                  setRowData={handleSetRowData}
                  originalRowData={originalRowData}
                  currentLoadCards={currentLoadCards}
                  handleUpdate={() => {
                    setShowSuccessModal(true);
                    setTimeout(() => setShowSuccessModal(false), 3000);
                  }}
                  customHeight="h-[calc(100vh-170px)]"
                  jobHeaders={
                    matrixData?.columns?.map((x: any) => ({
                      id: x.id,
                      poCode: x.poCode,
                    })) || []
                  }
                  footer={footer}
                  matrixData={matrixData}
                  selectedDate={selectedDate}
                  loadAssignments={loadAssignments}
                />
              </div>
            ) : (
              <div className={hasCardData ? "pt-[170px]" : "pt-4"}>
                <div className="flex items-center justify-center h-[450px] bg-white border rounded-lg border-gray-300">
                  <p className="text-lg font-medium text-gray-500">
                    No table data found.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <CancelRerouteDrawer
        open={openCancelDrawer}
        onClose={() => setOpenCancelDrawer(false)}
        onShowToast={handleShowToast}
      />
      <DispatchAssignmentGridModal
        open={openGridModal}
        onClose={() => setOpenGridModal(false)}
        onOpenCancelDrawer={() => setOpenCancelDrawer(true)}
        onRowClicked={() => setIsLiveTrackingModalOpen(true)}
        buttonStatus={buttonStatus}
        selectedDay={selectedDay}
        selectedDate={selectedDate}
        loadAssignments={loadAssignments}
        rowData={rowData}
        setRowData={handleSetRowData}
        originalRowData={originalRowData}
        handleUpdate={() => {
          setShowSuccessModal(true);

          setTimeout(() => {
            setShowSuccessModal(false);
          }, 3000);
        }}
        jobHeaders={
          matrixData?.columns?.map((x: any) => ({
            id: x.id,
            poCode: x.poCode,
          })) || []
        }
        footer={footer}
        matrixData={matrixData}
      />
      <DispatchDetailsModal
        open={openDispatchModal}
        onClose={() => setOpenDispatchModal(false)}
        loadCards={currentLoadCards}
        selectedDay={selectedDay}
        date={selectedDate}
        onCancelReroute={() => setOpenCancelDrawer(true)}
      />
      <EditDispatchModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDispatchId(null);
        }}
        isEdit={true}
        dispatchId={selectedDispatchId}
      />
      <LiveShipmentTrackingModal
        isOpen={isLiveTrackingModalOpen}
        onClose={() => setIsLiveTrackingModalOpen(false)}
      />
      {/* <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        // title="You have successfully loaded the loads."
      /> */}
      <SuccessActionModal open={successModal.open} title={successModal.title} />
      <CommonConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSave}
        title="You have successfully updated the assigned loads."
        description=""
        confirmText=""
        cancelText=""
      />
      <ToastModal
        open={showToast}
        onClose={() => setShowToast(false)}
        title={toastTitle}
        type="success"
      />
    </div>
  );
};

export default AssignLoadsPage;
