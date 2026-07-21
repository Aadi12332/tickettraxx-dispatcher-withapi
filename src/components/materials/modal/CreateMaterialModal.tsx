import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import CommonTextInput from "../../common/CommonTextInput";
import CommonButton from "../../common/CommonButton";
import {
  createMaterialApi,
  updateMaterialApi,
} from "../../../services/auth.service";
import type { Material } from "../../../types/auth.types";

interface CreateMaterialModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Material | null;
  // Create/update successful hone ke baad parent ko batane ke liye, taaki list refresh ho sake
  onSuccess?: () => void;
}

const initialMaterial = "";

const CreateMaterialModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: CreateMaterialModalProps) => {
  const [materialName, setMaterialName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && editData) {
      setMaterialName(editData.name);
    } else {
      setMaterialName(initialMaterial);
    }
    setError("");
  }, [open, isEdit, editData]);

  const handleClose = () => {
    setMaterialName(initialMaterial);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!materialName.trim()) return;

    setLoading(true);
    try {
      if (isEdit && editData) {
        await updateMaterialApi(editData._id, {
          name: materialName.trim(),
        });
      } else {
        await createMaterialApi({
          name: materialName.trim(),
        });
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = materialName.trim() === "" || loading;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit Material" : "Create Materials"}
              </h2>

              <p className="mt-3 text-sm text-[#717182]">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <button onClick={handleClose} className="cursor-pointer">
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Form */}
          <div className="px-3 pb-4 mt-6">
            <div className="grid grid-cols-1 gap-6 max-h-[55dvh] overflow-y-auto">
              <CommonTextInput
                label="Material Name"
                placeholder="Enter name..."
                value={materialName}
                onChange={setMaterialName}
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Footer */}
            <div className="border-t border-[#E5E7EB] mt-8 pt-5 flex justify-center flex-wrap gap-4">
              <CommonButton
                size="md"
                variant="primary"
                icon={!isEdit ? <Plus size={18} /> : undefined}
                onClick={handleSubmit}
                className={`sm:flex-1 ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Saving..." : isEdit ? "Save" : "Create Material"}
              </CommonButton>

              <CommonButton
                size="md"
                variant="secondary"
                onClick={handleClose}
                className="sm:flex-1"
              >
                Cancel
              </CommonButton>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateMaterialModal;
