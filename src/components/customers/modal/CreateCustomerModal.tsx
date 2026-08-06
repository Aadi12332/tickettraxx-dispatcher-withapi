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

const CreateCustomerModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: CreateCustomerModalProps) => {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && editData) {
      setName(editData.name || "");
      setContactName((editData as any).contactName || "");
      setEmail(editData.email || "");
      setPhone(editData.phone || "");
      setAddress(editData.address || "");
    } else {
      setName(initialName);
      setContactName("");
      setEmail("");
      setPhone("");
      setAddress("");
    }
    setError("");
  }, [open, isEdit, editData]);

  const handleClose = () => {
    setName(initialName);
    setContactName("");
    setEmail("");
    setPhone("");
    setAddress("");
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
        contactName: contactName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

      if (isEdit && editData) {
        await updateCustomerApi(editData._id, payload);
      } else {
        await createCustomerApi(payload);
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
            </div>

            <button onClick={handleClose} className="cursor-pointer">
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Form */}
          <div className="px-3 pb-4 mt-6">
            <div className="grid grid-cols-1 gap-6 max-h-[55dvh] overflow-y-auto">
              <CommonTextInput
                label="Customer Name"
                placeholder="Enter name..."
                value={name}
                onChange={setName}
              />

              <CommonTextInput
                label="Contact Name"
                placeholder="Enter contact name..."
                value={contactName}
                onChange={setContactName}
              />

              <CommonTextInput
                label="Email"
                placeholder="Enter email..."
                value={email}
                onChange={setEmail}
              />

              <CommonTextInput
                label="Phone"
                placeholder="Enter phone..."
                value={phone}
                onChange={setPhone}
              />

              <CommonTextInput
                label="Address"
                placeholder="Enter address..."
                value={address}
                onChange={setAddress}
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
