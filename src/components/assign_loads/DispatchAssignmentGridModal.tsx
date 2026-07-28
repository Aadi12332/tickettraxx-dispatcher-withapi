import { Modal } from "@mui/material";
import collapsed from "../../assets/icons/collapsed.svg";
import DispatchAssignmentGrid from "./DispatchAssignmentGrid";
// import { useEffect, useState } from "react";
import { useAssignLoad } from "../../pages/assign_loads/AssignLoadContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenCancelDrawer: () => void;
  onRowClicked: () => void;
  buttonStatus: boolean;
  selectedDay?: string;
  rowData: any[];
  setRowData: React.Dispatch<React.SetStateAction<any[]>>;
  originalRowData: any[];
  handleUpdate: () => void;
  jobHeaders?: any[];
  footer?: any;
  matrixData?: any;
}

const DispatchAssignmentGridModal = ({
  open,
  onClose,
  onOpenCancelDrawer,
  onRowClicked,
  buttonStatus,
  selectedDay,
  rowData,
  setRowData,
  originalRowData,
  handleUpdate,
  jobHeaders,
  footer,
  matrixData,
}: Props) => {
  const { selectedDate } = useAssignLoad();
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-[#F4F5F8] flex items-start justify-center z-50">
        <div className="w-dvw h-dvh bg-[#F4F5F8] flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 h-[45px] px-6 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold">
              Dispatch Details for {selectedDate || ""}
            </h2>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center cursor-pointer"
            >
              <img src={collapsed} alt="Close" className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Grid Section */}
          <div className="flex-1">
            <div className="bg-white p-2 overflow-y-auto">
              <DispatchAssignmentGrid
                onOpenCancelDrawer={onOpenCancelDrawer}
                onRowClicked={onRowClicked}
                buttonStatus={buttonStatus}
                selectedDay={selectedDay}
                rowData={rowData}
                setRowData={setRowData}
                originalRowData={originalRowData}
                handleUpdate={handleUpdate}
                customHeight="h-[calc(100vh-65px)]"
                jobHeaders={jobHeaders}
                footer={footer}
                matrixData={matrixData}
              />
            </div>
          </div>
        </div>
      </div>
      {/* <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        /> */}
    </Modal>
  );
};

export default DispatchAssignmentGridModal;
