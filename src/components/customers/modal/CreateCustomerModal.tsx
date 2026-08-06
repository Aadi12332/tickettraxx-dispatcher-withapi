import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import CommonTextInput from "../../common/CommonTextInput";
import CommonButton from "../../common/CommonButton";
import {
  createCustomerApi,
  updateCustomerApi,
} from "../../../services/auth.service";
import type { Customer } from "../../../types/auth.types";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Customer | null;
  onSuccess?: () => void;
}

const initialName = "";
const initialCode = "";

const CreateCustomerModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: CreateCustomerModalProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && editData) {
      setName(editData.name || "");
      // NOTE: API now expects `code` field
      setCode((editData as any).code || "");
    } else {
      setName(initialName);
      setCode(initialCode);
    }
    setError("");
  }, [open, isEdit, editData]);

  const handleClose = () => {
    setName(initialName);
    setCode(initialCode);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        // send code as per new API
        code: code.trim() || undefined,
      };

      if (isEdit && editData) {
        await updateCustomerApi(editData._id, payload as any);
      } else {
        await createCustomerApi(payload as any);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error?.message ||
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = name.trim() === "" || loading;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit Customer" : "Create Customer"}
              </h2>

              <p className="mt-3 text-sm text-[#717182]">
                Create or update a customer.
              </p>

              {/* API error shown at top of modal if any */}
              {error && (
                <p className="mt-3 text-sm text-red-500">{error}</p>
              )}
            </div>

            <button onClick={handleClose} className="cursor-pointer">
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Form */}
          <div className="px-3 pb-4 mt-2">
            <div className="grid grid-cols-1 gap-6 max-h-[55dvh] overflow-y-auto">
              <CommonTextInput
                label="Customer Name"
                placeholder="Enter name..."
                value={name}
                onChange={setName}
              />

              <CommonTextInput
                label="Code"
                placeholder="Enter code (e.g., PST)"
                value={code}
                onChange={setCode}
              />
            </div>

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
                {loading ? "Saving..." : isEdit ? "Save" : "Create Customer"}
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

export default CreateCustomerModal;

