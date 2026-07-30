// @ts-nocheck
import { Modal } from "@mui/material";
import AssignLoadCard from "../assign_loads/AssignLoadCard";
import EditDispatchModal from "./modal/EditDispatchModal";
import collapsed from "../../assets/icons/collapsed.svg";
import { useAppSelector } from "../../store";
import { useMemo, useState } from "react";
import {
  selectLoadCards,
  type AssignLoadCardData,
} from "../../store/dispatchSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  loadCards: AssignLoadCardData[];
  onCancelReroute: () => void;
  selectedDay?: string;
  date?: string;
}

const mapMatrixColumnToCard = (item: any): AssignLoadCardData => ({
  driverName: item.customerName,
  delivery: item.delivery,
  jobId: item.poCode,
  dispatchId: item.dispatchId,
  loads: item.loads,
  rate: item.rate,
  contractorRate: item.contractorRate,
  pickup: item.pickup,
  material: item.material,
  time: item.time,
  headerColor: item.headerColor ?? "yellow",
});

const DispatchDetailsModal = ({
  open,
  onClose,
  onCancelReroute,
  selectedDay,
  date,
  loadCards,
}: Props) => {
  const selectedDayRedux = useAppSelector(
    (state) => state.dispatch.selectedDay,
  );
  const loadCardsRedux = useAppSelector(selectLoadCards);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(null);

  const activeDay = selectedDay || selectedDayRedux;
  const currentLoadCards = useMemo(() => {
    return loadCards;
  }, [loadCards]);

  return (
    <Modal open={open} onClose={onClose}>
      <>
      <div className="fixed inset-0 bg-black/5 flex items-start justify-center pt-[12dvh]  p-4">
        <div className="w-[96vw] max-w-[1800px] bg-[#F4F5F8] rounded-xl shadow-xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 h-[45px] px-6 flex items-center justify-between rounded-t-xl">
            <h2 className="text-lg font-semibold">
              Dispatch Details for {activeDay || date || "N/A"}
            </h2>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center cursor-pointer"
            >
              <img src={collapsed} alt="" className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Cards Section Only */}
          <div className="p-2">
            <div
              className="flex gap-4 overflow-x-scroll pb-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1D3461 #D9D9D9",
              }}
            >
              {currentLoadCards.map((card, index) => (
                <AssignLoadCard
                  key={index}
                  {...card}
                  expandOnHover={false}
                  onCancelReroute={onCancelReroute}
                  onEditDispatch={(dispatchId) => {
                    setSelectedDispatchId(dispatchId ?? null);
                    setShowEditModal(true);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <EditDispatchModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDispatchId(null);
        }}
        isEdit={true}
        dispatchId={selectedDispatchId}
      />
      </>
    </Modal>
  );
};

export default DispatchDetailsModal;
