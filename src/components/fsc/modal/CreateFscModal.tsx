import { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import axios from "axios";
import CommonTextInput from "../../common/CommonTextInput";
import CommonSelectInput from "../../common/CommonSelectInput";
import CommonButton from "../../common/CommonButton";
import dayjs from "dayjs";
import { getCustomersApi, createFscApi, updateFscApi } from "../../../services/auth.service";

export interface EditFscData {
  _id: string;
  customerId: string;
  fromDate: string; // ISO date string
  toDate: string; // ISO date string
  percentage: number;
}
 
interface CreateFscModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: EditFscData | null;
  // Create/update successful hone ke baad parent ko batane ke liye, taaki list refresh ho sake
  onSuccess?: () => void;
}
 
const initialState = {
  customer: "",
  percentage: "",
  from: "",
  to: "",
};
 
const CreateFscModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: CreateFscModalProps) => {
  const [form, setForm] = useState(initialState);
  const [customerOptions, setCustomerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  // Customer dropdown ke liye list fetch karo jab bhi modal khule
  useEffect(() => {
    if (!open) return;
 
    const fetchCustomers = async () => {
      try {
        const res = await getCustomersApi();
        setCustomerOptions(
          res.data.map((c) => ({ label: `${c.name} (${c.code})`, value: c._id }))
        );
      } catch {
        setError("Unable to load customers list.");
      }
    };
 
    fetchCustomers();
  }, [open]);
 
  useEffect(() => {
    if (!open) return;
 
    if (isEdit && editData) {
      setForm({
        customer: editData.customerId,
        percentage: String(editData.percentage),
        from: dayjs(editData.fromDate).format("YYYY-MM-DD"),
        to: dayjs(editData.toDate).format("YYYY-MM-DD"),
      });
    } else {
      setForm(initialState);
    }
    setError("");
  }, [open, isEdit, editData]);
 
  const handleClose = () => {
    setForm(initialState);
    setError("");
    onClose();
  };
 
  const handleSubmit = async () => {
    setError("");
 
    if (!form.customer || !form.percentage || !form.from || !form.to) {
      setError("Please fill all the fields");
      return;
    }
 
    // CommonTextInput (isPercentage) ho sakta hai value me "%" bhi bhej de,
    // aur Number("8%") NaN deta hai jo JSON.stringify me chup-chaap null ban jata hai.
    // Isliye pehle sirf digits/decimal point rakh kar clean karte hain.
    const cleanedPercentage = String(form.percentage).replace(/[^0-9.]/g, "");
    const percentageValue = Number(cleanedPercentage);
 
    if (!cleanedPercentage || Number.isNaN(percentageValue)) {
      setError("Please enter a valid percentage");
      return;
    }
 
    setLoading(true);
    try {
      if (isEdit && editData) {
        await updateFscApi(editData._id, {
          customerId: form.customer,
          fromDate: form.from,
          toDate: form.to,
          percentage: percentageValue,
        });
      } else {
        await createFscApi({
          customerId: form.customer,
          fromDate: form.from,
          toDate: form.to,
          percentage: percentageValue,
        });
      }
 
      onSuccess?.();
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit FSC" : "Create FSC"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <CommonSelectInput
                label="Customer"
                value={form.customer}
                options={customerOptions}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    customer: value,
                  }))
                }
              />
 
              <CommonTextInput
                label="Percentage"
                placeholder="%"
                value={form.percentage}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    percentage: value,
                  }))
                }
                isPercentage
              />
 
              <CommonTextInput
                label="From"
                type="date"
                value={form.from}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    from: value,
                  }))
                }
              />
 
              <CommonTextInput
                label="To"
                type="date"
                value={form.to}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    to: value,
                  }))
                }
              />
            </div>
 
            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}
 
            {/* Footer */}
            <div className="border-t border-[#E5E7EB] mt-8 pt-5 flex gap-4 flex-wrap justify-center">
              <CommonButton
                size="md"
                variant="primary"
                className="sm:flex-1"
                icon={!isEdit ? <Plus size={18} /> : undefined}
                onClick={handleSubmit}
              >
                {loading ? "Saving..." : isEdit ? "Save" : "Create FSC"}
              </CommonButton>
 
              <CommonButton
                size="md"
                variant="secondary"
                className="sm:flex-1"
                onClick={handleClose}
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
 
export default CreateFscModal;