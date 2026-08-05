import { Modal } from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";
import CommonButton from "../../components/common/CommonButton";
import CommonSelectInput from "../../components/common/CommonSelectInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onAssign: () => void;
}

const driverOptions = [
  { label: "John Smith", value: "1" },
  { label: "David Johnson", value: "2" },
  { label: "Michael Brown", value: "3" },
];

const truckOptions = [
  { label: "Volvo - TX1234", value: "1" },
  { label: "CAT - TX9876", value: "2" },
  { label: "Mack - TX1122", value: "3" },
];

export default function AssignLoadModal({
  open,
  onClose,
  onAssign,
}: Props) {
  const [driver, setDriver] = useState("");
  const [truck, setTruck] = useState("");

  const handleAssign = () => {
    if (!driver || !truck) return;

    onAssign();

    setDriver("");
    setTruck("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

        <div className="bg-white rounded-xl w-[500px] p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Assign Load
            </h2>

            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <CommonSelectInput
            label="Driver"
            value={driver}
            options={driverOptions}
            placeholder="Select Driver"
            onChange={setDriver}
          />

          <div className="mt-5"/>

          <CommonSelectInput
            label="Truck"
            value={truck}
            options={truckOptions}
            placeholder="Select Truck"
            onChange={setTruck}
          />

          <div className="flex gap-4 mt-8">

            <CommonButton
              className="flex-1"
              disabled={!driver || !truck}
              onClick={handleAssign}
            >
              Assign Load
            </CommonButton>

            <CommonButton
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </CommonButton>

          </div>

        </div>

      </div>
    </Modal>
  );
}