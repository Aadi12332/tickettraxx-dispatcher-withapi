// @ts-nocheck
import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import DispatchAssignmentGrid from "../DispatchAssignmentGrid";
import CancelRerouteDrawer from "../CancelRerouteDrawer";
import EditDispatchModal from "./EditDispatchModal";
import AssignLoadCard from "../AssignLoadCard";
import CommonButton from "../../common/CommonButton";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setRowData, selectLoadCards, type AssignLoadCardData, setOriginalRowData } from "../../../store/dispatchSlice";
import SuccessActionModal from "../SuccessActionModal";
import { getAssignmentMatrixApi } from "../../../services/auth.service";
import { mapMatrixColumnToCard } from "../../../pages/assign_loads/AssignLoadsPage";

interface Props {
  open: boolean;
  onClose: () => void;
  loadCards?: any[];
  isCanceled?: boolean;
  date?: any;
  setDate?: (date: any) => void;
}

const AssignLoadsExpandModal = ({
  open,
  onClose,
  isCanceled,
  date
}: Props) => {

const [successModal, setSuccessModal] = useState({
  open: false,
  title: "",
});
  const [openCancelDrawer, setOpenCancelDrawer] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [buttonStatus] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [assignmentCards, setAssignmentCards] = useState<AssignLoadCardData[]>([]);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);
  const dispatch = useAppDispatch();
  const selectedDay = useAppSelector((state) => state.dispatch.selectedDay);
  const loadCardsFromRedux = useAppSelector(selectLoadCards);
  const rowData = useAppSelector((state) => state.dispatch.rowData);
  const originalRowData = useAppSelector((state) => state.dispatch.originalRowData);

  const currentLoadCards = useMemo(() => {
    const offset = selectedDay.charCodeAt(selectedDay.length - 1) % 5;

    return loadCardsFromRedux.map((card: AssignLoadCardData) => ({
      ...card,
      driverName: `${card.driverName}`,
      loads: card.loads + offset * 5,
    }));
  }, [loadCardsFromRedux, selectedDay]);

  const handleSetRowData = (newData: any) => {
    if (typeof newData === "function") {
      dispatch(setRowData(newData(rowData)));
    } else {
      dispatch(setRowData(newData));
    }
  };

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

 const loadAssignments = async () => {
    setCardsLoading(true);
    try {
      const res = await getAssignmentMatrixApi(date);
      console.log("Assignment Matrix API Response:", res);
      setMatrixData(res.data?.data);
      setFooter(res.data?.footer);

      setAssignmentCards(res.data?.data?.columns.map(mapMatrixColumnToCard));
      const rows = res.data?.data?.rows.map((row: any) => ({
        driver: row.driver,
        truckId: row.truckId,
        tonnage: row.tonnage,
        total: row.total,
        status: row.status,
        weCall: row.weCall,

        jobs: row.jobs.map((job: any) => {
          const column = res.data?.data?.columns.find(
            (c: any) => c.id === job.id
          );

          return {
            ...job,
            id: column?.poCode ?? job.id,
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
console.log({cardsLoading, assignmentCards, matrixData, footer, rowData, originalRowData});
  useEffect(() => {
    loadAssignments();
  }, [date]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          zIndex: 1200,
        }}
      >
        {/* <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-999">
          <div className="w-full h-[95vh] bg-white rounded-[14px] flex flex-col overflow-hidden"> */}
        <div className="fixed inset-0 bg-[#F4F5F8] flex items-start justify-center z-50">
          <div className="w-dvw h-dvh bg-[#F4F5F8] flex flex-col">
            {/* Header */}
            <div className="md:h-[60px] shrink-0 border-b border-[#E5E7EB] px-3 py-3 flex gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="md:text-xl text-base font-medium text-[#2F2F2F]">
                  Dispatch Details for 
                  <span className="font-bold ml-1">{date??new Date().toISOString().split("T")[0]}</span>
                </h2>
              </div>

              <div className="flex items-center gap-2 ml-auto min-w-max">
                {!isCanceled && (
                  <CommonButton
                    variant="secondary"
                    icon={<Plus size={18} className="text-green-500" />}
                    onClick={() => setOpenModal(true)}
                    size="md"
                  >
                    Add Batch
                  </CommonButton>
                )}
                <CommonButton
                  iconOnly
                  icon={<X size={26} />}
                  onClick={onClose}
                  variant="secondary"
                  className="border-none px-0"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Cards */}
              <div
                className="px-3 pt-4 pb-2 overflow-x-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#1D3461 #D9D9D9",
                }}
              >
                <div className="flex gap-5 min-w-max pb-2">
                  {currentLoadCards.map((card: AssignLoadCardData, index: number) => (
                    <AssignLoadCard
                      key={index}
                      {...card}
                      expandOnHover={true}
                      onCancelReroute={() => setOpenCancelDrawer(true)}
                      onEditDispatch={() => setShowEditModal(true)}
                    />
                  ))}
                </div>
              </div>

              {/* Search / Actions */}
              {/* <div className="px-6 pb-4 flex items-center gap-3">
                <input
                  type="date"
                  className="h-[40px] px-4 border border-[#E5E7EB] rounded-lg outline-none"
                />

                <button className="w-[40px] h-[40px] rounded-lg bg-sky-blue text-white flex items-center justify-center cursor-pointer">
                  <Search size={16} />
                </button>
                <CommonButton
                  onClick={() => setButtonStatus(!buttonStatus)}
                  variant={`${buttonStatus ? "primary" : "secondary"}`}
                >
                  {`${buttonStatus ? "Resume" : "Will Call"}`}
                </CommonButton>
                <button className="w-[40px] h-[40px] rounded-lg border border-[#E5E7EB] flex items-center justify-center cursor-pointer">
                  <RefreshCcw size={16} />
                </button>
              </div> */}

              {/* Grid */}
              <div className="px-3 pb-3 mt-1 overflow-auto">
                <div className="">
                  <DispatchAssignmentGrid
                    selectedDay={selectedDay}
                    buttonStatus={buttonStatus}
                    rowData={rowData}
                    setRowData={handleSetRowData}
                    originalRowData={originalRowData}
                    onOpenCancelDrawer={() => setOpenCancelDrawer(true)}
                    onRowClicked={() => {}}
                    customHeight="h-[calc(100vh-95px)]"
                    enableColumnResize={false}
                    jobHeaders={matrixData?.columns?.map((x: any) => x.poCode) || []}
        footer={matrixData?.footer}
        matrixData={matrixData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

<CancelRerouteDrawer
  open={openCancelDrawer}
  onClose={() => setOpenCancelDrawer(false)}
  onShowToast={handleShowToast}
/>

<SuccessActionModal
  open={successModal.open}
  title={successModal.title}
/>

      <EditDispatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        isEdit={false}
      />

      <EditDispatchModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        isEdit={true}
      />
    </>
  );
};

export default AssignLoadsExpandModal;
