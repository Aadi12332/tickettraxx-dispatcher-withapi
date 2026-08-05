import { Modal } from "@mui/material";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AssignLoadSuccessModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl w-[420px] p-8 relative">
          <button className="absolute right-4 top-4" onClick={onClose}>
            <X />
          </button>

          <div className="flex justify-center">
            <CheckCircle2 size={70} className="text-green-500" />
          </div>

          <h2 className="text-center text-xl font-semibold mt-5">
            Successfully Assigned
          </h2>

          <p className="text-center text-gray-500 mt-2">
            Load assigned successfully.
          </p>
        </div>
      </div>
    </Modal>
  );
}
