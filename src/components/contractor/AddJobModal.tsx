import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import CommonTextInput from "../common/CommonTextInput";
import CommonSelectInput from "../common/CommonSelectInput";
import { useEffect, useMemo, useState } from "react";
import {
  getMaterialsApi,
  getTrucksApi,
  createJobApi,
} from "../../services/auth.service";

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  contractorId?: string;
  onSuccess?: () => void;
}

interface OptionType {
  label: string;
  value: string;
}

const initialForm = {
  jobName: "",
  material: "",
  weight: "",
  truckId: "",
};

const AddJobModal = ({
  open,
  onClose,
  contractorId,
  onSuccess,
}: AddJobModalProps) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [materialOptions, setMaterialOptions] = useState<OptionType[]>([]);
  const [truckOptions, setTruckOptions] = useState<OptionType[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [materialsRes, trucksRes] = await Promise.all([
          getMaterialsApi(1, 100),
          getTrucksApi(1, 100, contractorId),
        ]);

        setMaterialOptions(
          materialsRes.data.map((m) => ({ label: m.name, value: m._id })),
        );
        setTruckOptions(
          trucksRes.data.map((t) => ({
            label: t.unitNumber,
            value: t._id,
          })),
        );
      } catch (err) {
        console.error("Failed to load Add Job options:", err);
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, [open, contractorId]);

  const handleChange = (key: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isFormValid = useMemo(() => {
    return (
      form.jobName.trim() !== "" &&
      form.material.trim() !== "" &&
      form.weight.trim() !== "" &&
      form.truckId.trim() !== ""
    );
  }, [form]);

  const handleClose = () => {
    setForm(initialForm);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    setError("");
    setSubmitting(true);
    try {
      // NOTE: the Jobs API expects customerId / pickupSiteId / deliverySiteId /
      // rate which this form doesn't collect, and has no concept of "truckId".
      // Sending only the fields we actually have from this form.
      await createJobApi({
        code: form.jobName,
        customerId: "",
        pickupSiteId: "",
        deliverySiteId: "",
        materialId: form.material,
        rate: 0,
        weightPerTrip: Number(form.weight) || 0,
      } as any);

      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to add job:", err);
      setError("Failed to add job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[570px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 md:px-2 md:pt-6 pt-3 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-medium text-black">Add Job</h2>

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
          <div className="px-4 md:px-2 pt-5 pb-4 ">
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="space-y-6">
              <CommonTextInput
                label="Job Name"
                placeholder="Enter name..."
                value={form.jobName}
                onChange={(value) => handleChange("jobName", value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CommonSelectInput
                  label="Material"
                  value={form.material}
                  placeholder="Select one..."
                  onChange={(value) => handleChange("material", value)}
                  options={materialOptions}
                  disabled={optionsLoading}
                />

                <CommonTextInput
                  label="Weight (tones)"
                  placeholder="e.g., 29.00"
                  value={form.weight}
                  onChange={(value) => handleChange("weight", value)}
                />
              </div>

              <div className="w-full md:w-1/2">
                <CommonSelectInput
                  label="Truck ID"
                  value={form.truckId}
                  placeholder="Select one..."
                  onChange={(value) => handleChange("truckId", value)}
                  options={truckOptions}
                  disabled={optionsLoading}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-4 mt-10">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || submitting}
                className={`flex-1 min-w-[200px] h-[40px] rounded-[8px] text-sm font-normal flex items-center justify-center gap-1
                  ${
                    isFormValid && !submitting
                      ? "bg-primary text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <Plus size={18} />
                {submitting ? "Adding..." : "Add Job"}
              </button>

              <button
                onClick={handleClose}
                className="flex-1 h-[40px] border border-primary text-primary rounded-[8px] text-sm font-normal cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddJobModal;