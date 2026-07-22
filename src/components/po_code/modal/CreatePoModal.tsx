import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CommonTextInput from "../../common/CommonTextInput";
import CommonSelectInput from "../../common/CommonSelectInput";
import type {
  Job,
  CreateJobPayload,
  UpdateJobPayload,
} from "../../../types/auth.types";
import {
  getCustomersApi,
  getMaterialsApi,
  siteService,
  createJobApi,
  updateJobApi,
  createCustomerApi,
} from "../../../services/auth.service";

interface CreatePOCodeModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  job?: Job | null;
  onOpenPickupModal?: () => void;
  onSuccess?: () => void;
}

interface OptionType {
  label: string;
  value: string;
}

const initialFormData = {
  poCode: "",
  material: "",
  customer: "",
  thirdPartyCustomer: "",
  invoiceRate: "",
  contractorRate: "",
  pickup: "",
  deliver: "",
};

const resolveId = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "_id" in val) {
    return (val as { _id: string })._id;
  }
  return "";
};

const jobToFormData = (job: Job) => ({
  poCode: job.code || "",
  material: resolveId(job.materialId),
  customer: resolveId(job.customerId),
  thirdPartyCustomer: resolveId(job.thirdPartyCustomerId),
  invoiceRate: job.rate != null ? String(job.rate) : "",
  contractorRate: job.contractorRate != null ? String(job.contractorRate) : "",
  pickup: resolveId(job.pickupSiteId),
  deliver: resolveId(job.deliverySiteId),
});

const CreatePOCodeModal = ({
  open,
  onClose,
  isEdit = false,
  job = null,
  onOpenPickupModal,
  onSuccess,
}: CreatePOCodeModalProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [thirdPartyOptions, setThirdPartyOptions] = useState<OptionType[]>([]);
  const [customerOptions, setCustomerOptions] = useState<OptionType[]>([]);
  const [materialOptions, setMaterialOptions] = useState<OptionType[]>([]);
  const [pickupOptions, setPickupOptions] = useState<OptionType[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<OptionType[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [newThirdPartyName, setNewThirdPartyName] = useState("");

  useEffect(() => {
    if (!open) return;

    setFormData(isEdit && job ? jobToFormData(job) : initialFormData);
  }, [open, isEdit, job]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [, materialsRes, pickupSitesRes, deliverSitesRes] =
          await Promise.all([
            loadCustomers(),
            getMaterialsApi(1, 100),
            siteService.getSites({ type: "pickup", limit: 100 }),
            siteService.getSites({ type: "deliver", limit: 100 }),
          ]);
        setMaterialOptions(
          materialsRes.data.map((m) => ({ label: m.name, value: m._id })),
        );
        setPickupOptions(
          pickupSitesRes.data.map((s) => ({ label: s.name, value: s._id })),
        );
        setDeliveryOptions(
          deliverSitesRes.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (err) {
        console.error("Failed to load PO code options:", err);
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, [open]);

  const loadCustomers = async () => {
    const customersRes = await getCustomersApi(1, 100);

    const options = customersRes.data.map((c) => ({
      label: c.name,
      value: c._id,
    }));

    setCustomerOptions(options);
    setThirdPartyOptions(options);

    return customersRes.data;
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = useMemo(() => {
    const requiredFields = Object.entries(formData).filter(
      ([key]) => key !== "thirdPartyCustomer",
    );

    return requiredFields.every(([, value]) => String(value).trim() !== "");
  }, [formData]);

  const parseAmount = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    return cleaned ? Number(cleaned) : 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    let thirdPartyCustomerId: string | undefined =
  formData.thirdPartyCustomer || undefined;

if (
  newThirdPartyName &&
  !thirdPartyOptions.some((o) => o.value === formData.thirdPartyCustomer)
) {
  const res = await createCustomerApi(newThirdPartyName);

  await loadCustomers();

  thirdPartyCustomerId = res.data._id;
}

const payload: CreateJobPayload | UpdateJobPayload = {
  code: formData.poCode,
  customerId: formData.customer,
  materialId: formData.material,
  pickupSiteId: formData.pickup,
  deliverySiteId: formData.deliver,
  thirdPartyCustomerId,
  rate: parseAmount(formData.invoiceRate),
  contractorRate: parseAmount(formData.contractorRate),
  date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
};

    setSubmitting(true);
    try {
      if (isEdit && job) {
        await updateJobApi(job._id, payload);
      } else {
        await createJobApi(payload as CreateJobPayload);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to save PO code:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit PO Code" : "Create PO Code"}
              </h2>

              <p className="mt-3 text-sm text-[#717182]">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>

            <button onClick={onClose} className="cursor-pointer">
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Form */}
          <div className="px-4 pb-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 max-h-[70dvh] overflow-y-auto">
              <CommonTextInput
                label="Enter New PO Code / JobID#"
                placeholder="Enter..."
                value={formData.poCode}
                onChange={handleChange("poCode")}
              />

              <CommonSelectInput
                label="Material"
                value={formData.material}
                placeholder="Select one..."
                onChange={handleChange("material")}
                options={materialOptions}
                // disabled={optionsLoading}
              />

              <CommonSelectInput
                label="Select Customer"
                value={formData.customer}
                placeholder="Select one..."
                onChange={handleChange("customer")}
                options={customerOptions}
                // disabled={optionsLoading}
              />

              <CommonSelectInput
                label="Third Party Customer (if any)"
                value={formData.thirdPartyCustomer}
                onChange={handleChange("thirdPartyCustomer")}
                options={thirdPartyOptions}
                addNewLabel="Add New"
               onAddNew={(value) => {
  setNewThirdPartyName(value);

  setFormData((prev) => ({
    ...prev,
    thirdPartyCustomer: value,
  }));
}}
              />

              <CommonTextInput
                label="Invoice Rate"
                placeholder="$0.00"
                value={formData.invoiceRate}
                onChange={handleChange("invoiceRate")}
                isAmount
              />

              <CommonTextInput
                label="Contractor Rate"
                placeholder="$0.00"
                value={formData.contractorRate}
                onChange={handleChange("contractorRate")}
                isAmount
              />

              <CommonSelectInput
                label="Pickup"
                value={formData.pickup}
                placeholder="Select one..."
                onChange={handleChange("pickup")}
                options={pickupOptions}
                addNewLabel="Add New"
                addNewMode="modal"
                onAddNew={onOpenPickupModal}
                // disabled={optionsLoading}
              />

              <CommonSelectInput
                label="Deliver"
                value={formData.deliver}
                placeholder="Select one..."
                onChange={handleChange("deliver")}
                options={deliveryOptions}
                addNewLabel="Add New"
                addNewMode="modal"
                onAddNew={onOpenPickupModal}
                // disabled={optionsLoading}
              />
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || submitting}
                className={`flex-1 min-w-[200px] h-[40px] rounded-[8px] text-sm font-normal flex items-center justify-center gap-1 transition-all
                  ${
                    isFormValid && !submitting
                      ? "bg-primary text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {!isEdit && <Plus size={18} />}
                {submitting ? "Saving..." : isEdit ? "Save" : "Create PO Code"}
              </button>

              <button
                onClick={onClose}
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

export default CreatePOCodeModal;
