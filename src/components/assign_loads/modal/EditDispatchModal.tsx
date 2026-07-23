import { Modal } from "@mui/material";
import { X, Plus, Minus } from "lucide-react";
import CommonTextInput from "../../common/CommonTextInput";
import CommonSelectInput from "../../common/CommonSelectInput";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePickupModal from "../../pickup/modal/CreatePickupModal";
import {
  getJobsApi,
  createLoadApi,
  siteService,
} from "../../../services/auth.service";
import type { Job, CreateLoadPayload } from "../../../types/auth.types";

interface EditDispatchModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  isEdit?: boolean;
  onOpenPickupModal?: () => void;
  /** Required to create a Load against an existing dispatch. */
  dispatchId?: string;
  onSuccess?: () => void;
}

const initialFormData = {
  dispatchDate: "",
  customer: "",
  poCode: "", // holds jobId
  material: "",
  loads: "",
  // weightPerTrip: "",
  invoiceRate: "",
  contractorRate: "",
  pickup: "",
  deliver: "",
  startTime: "",
  endTime: "",
  comment: "",
};

const resolveId = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "_id" in val) {
    return (val as { _id: string })._id;
  }
  return "";
};

const parseAmount = (value: string): number => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  return cleaned ? Number(cleaned) : 0;
};

const EditDispatchModal = ({
  open,
  onClose,
  title,
  description,
  isEdit,
  onOpenPickupModal,
  dispatchId,
  onSuccess,
}: EditDispatchModalProps) => {
  const [columns, setColumns] = useState<number[]>(isEdit ? [1] : []);
  const [formData, setFormData] = useState(initialFormData);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [siteMap, setSiteMap] = useState<Record<string, string>>({});
  const [optionsLoading, setOptionsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    setFormData(initialFormData);
    setColumns(isEdit ? [1] : []);
  }, [open, isEdit]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [jobsRes, pickupRes, deliverRes] = await Promise.all([
          getJobsApi(1, 100),
          siteService.getSites({ type: "pickup", limit: 100 }),
          siteService.getSites({ type: "deliver", limit: 100 }),
        ]);

        setJobs(jobsRes.data);

        const map: Record<string, string> = {};
        [...pickupRes.data, ...deliverRes.data].forEach((site) => {
          map[site._id] = site.name;
        });
        setSiteMap(map);
      } catch (err) {
        console.error("Failed to load dispatch options:", err);
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, [open]);

  const jobOptions = useMemo(
    () => jobs.map((j) => ({ label: j.code, value: j._id })),
    [jobs],
  );

  const customerOptions = useMemo(() => {
    const seen = new Map<string, string>();
    jobs.forEach((j) => {
      if (typeof j.customerId === "object" && j.customerId) {
        seen.set(j.customerId._id, j.customerId.name);
      }
    });
    return Array.from(seen, ([value, label]) => ({ label, value }));
  }, [jobs]);

  const handleClose = () => {
    onClose();
  };

  const handleDispatchDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dispatchDate: value }));

    if (columns.length === 0 && value) {
      setColumns([1]);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    if (field === "poCode") {
      const job = jobs.find((j) => j._id === value);

      if (job) {
        setFormData((prev) => ({
          ...prev,
          poCode: value,
          customer: resolveId(job.customerId),
          material: resolveId(job.materialId),
          pickup: resolveId(job.pickupSiteId),
          deliver: resolveId(job.deliverySiteId),
          invoiceRate: String(job.rate ?? ""),
        }));
      } else {
        setFormData((prev) => ({ ...prev, poCode: value }));
      }

      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const materialOptionsForSelectedJob = useMemo(() => {
    const job = jobs.find((j) => j._id === formData.poCode);
    if (job && typeof job.materialId === "object" && job.materialId) {
      return [{ label: job.materialId.name, value: job.materialId._id }];
    }
    return [];
  }, [jobs, formData.poCode]);

  const pickupOptions = useMemo(
    () => Object.entries(siteMap).map(([value, label]) => ({ label, value })),
    [siteMap],
  );

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    if (!dispatchId) {
      console.error("Cannot create a Load without a dispatchId.");
      return;
    }

    const payload: CreateLoadPayload = {
      customerId: formData.customer,
      dispatchId,
      jobId: formData.poCode,
      materialId: formData.material,
      pickupSiteId: formData.pickup,
      deliverySiteId: formData.deliver,
      numberOfTrips: Number(formData.loads) || 0,
      invoiceRate: parseAmount(formData.invoiceRate),
      contractorRate: parseAmount(formData.contractorRate),
      // weightPerTrip: Number(formData.weightPerTrip) || 0,
      startTime: formData.startTime,
      endTime: formData.endTime,
      comment: formData.comment || undefined,
    };

    setSubmitting(true);
    try {
      await createLoadApi(payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to create load:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddColumn = () => {
    setColumns((prev) => [...prev, prev.length + 1]);
  };
  const handleRemoveColumn = () => {
    if (columns.length > 0) {
      setColumns((prev) => prev.slice(0, -1));
    }
  };

  const isFormValid =
    formData.dispatchDate.trim() !== "" &&
    formData.customer.trim() !== "" &&
    formData.poCode.trim() !== "" &&
    formData.material.trim() !== "" &&
    formData.loads.trim() !== "" &&
    // formData.weightPerTrip.trim() !== "" &&
    formData.invoiceRate.trim() !== "" &&
    formData.contractorRate.trim() !== "" &&
    formData.pickup.trim() !== "" &&
    formData.deliver.trim() !== "" &&
    formData.startTime.trim() !== "" &&
    formData.endTime.trim() !== "" &&
    columns.length > 0;

  const disableActions = (!isEdit && !isFormValid) || submitting;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm max-h-[90dvh] flex flex-col overflow-hidden">
          <div className="shrink-0 px-3 py-3 xl:px-4 xl:py-3 flex items-start justify-between">
            <div>
              <h2 className="text-lg xl:text-xl font-normal text-black">
                {isEdit ? (title ?? "Edit Dispatch") : (title ?? "Create Dispatch")}
              </h2>
              <p className="mt-1 text-xs md:text-sm md:mt-2 text-[#717182]">
                {description ??
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-black hover:opacity-70 cursor-pointer"
            >
              <X className="size-5 md:size-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 xl:px-4 pb-3">
            <div className="mt-6">
              <CommonTextInput
                label="Dispatch Date"
                placeholder="mm/dd/yyyy"
                value={formData.dispatchDate}
                onChange={handleDispatchDateChange}
                type="date"
              />
            </div>

            {columns.map((_, index) => (
              <div key={index}>
                <h3 className="text-sm xl:text-base font-semibold mb-4 mt-5">
                  Column {index + 1}
                </h3>
                <div className="sm:grid-cols-2 grid-cols-1 mt-6 flex sm:grid flex-col gap-4">
                  <CommonSelectInput
                    label="Customer"
                    value={formData.customer}
                    onChange={handleChange("customer")}
                    options={customerOptions}
                  />

                  <CommonSelectInput
                    label="Job ID# / PO Code"
                    value={formData.poCode}
                    onChange={handleChange("poCode")}
                    options={jobOptions}
                  />
                  <CommonSelectInput
                    label="Material"
                    value={formData.material}
                    onChange={handleChange("material")}
                    options={materialOptionsForSelectedJob}
                  />

                  <CommonTextInput
                    label="Number of Loads"
                    value={formData.loads}
                    onChange={handleChange("loads")}
                    placeholder="Enter"
                  />

                  {/* <CommonTextInput
                    label="Weight per Trip"
                    value={formData.weightPerTrip}
                    onChange={handleChange("weightPerTrip")}
                    placeholder="Enter"
                  /> */}

                  <CommonTextInput
                    label="Invoice Rate"
                    value={formData.invoiceRate}
                    onChange={handleChange("invoiceRate")}
                    placeholder="$0.00"
                    isAmount
                  />

                  <CommonTextInput
                    label="Contractor Rate"
                    value={formData.contractorRate}
                    onChange={handleChange("contractorRate")}
                    placeholder="$0.00"
                    isAmount
                  />

                  <CommonSelectInput
                    label="Pickup"
                    value={formData.pickup}
                    onChange={handleChange("pickup")}
                    options={pickupOptions}
                    addNewLabel="Add New"
                    onAddNew={onOpenPickupModal}
                    addNewMode="modal"
                  />

                  <CommonSelectInput
                    label="Deliver"
                    value={formData.deliver}
                    onChange={handleChange("deliver")}
                    options={pickupOptions}
                    addNewLabel="Add New"
                    onAddNew={onOpenPickupModal}
                    addNewMode="modal"
                  />

                  <CommonTextInput
                    label="Start Time"
                    value={formData.startTime}
                    onChange={handleChange("startTime")}
                    type="time"
                  />

                  <CommonTextInput
                    label="End Time"
                    value={formData.endTime}
                    onChange={handleChange("endTime")}
                    type="time"
                  />

                  {columns.length > 0 && (
                    <div className="mt-6 col-span-2">
                      <label className="block text-sm xl:text-base mb-2">
                        Comment
                      </label>

                      <textarea
                        placeholder="Enter..."
                        value={formData.comment}
                        onChange={(e) => handleChange("comment")(e.target.value)}
                        className="w-full h-[120px] border-[0.85px] border-[#E5E7EB] rounded-[8px] p-2 md:p-4 resize-none outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm xl:text-base font-semibold">Columns:</span>

              <button
                onClick={handleAddColumn}
                className="w-7 h-7 rounded flex items-center justify-center text-white bg-[#22C55E] cursor-pointer"
              >
                <Plus size={18} />
              </button>
              <button
                disabled={columns.length === 0}
                onClick={handleRemoveColumn}
                className={`w-7 h-7 rounded flex items-center justify-center text-white
                ${columns.length ? "bg-[#FF0000] cursor-pointer" : "bg-[#FF0000] cursor-not-allowed"}`}
              >
                <Minus size={18} />
              </button>
            </div>
          </div>
          <div className="shrink-0 border-t border-[#E5E7EB] px-4 xl:px-8 py-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSubmit}
                disabled={disableActions}
                className="flex-1 min-w-[200px] h-[40px] bg-primary text-white rounded-[8px] text-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-default"
              >
                {!isEdit && <Plus size={18} />}
                {submitting ? "Saving..." : !isEdit ? "Add Dispatch" : "Save"}
              </button>

              <button
                onClick={handleAddColumn}
                disabled={disableActions}
                className="flex-1 min-w-[200px] h-[40px] border border-primary text-primary rounded-[8px] text-sm cursor-pointer disabled:opacity-50 disabled:cursor-default"
              >
                Add Another Column
              </button>

              {(isEdit || formData.poCode) && (
                <button
                  onClick={() => navigate("/assign-loads")}
                  disabled={disableActions}
                  className="flex-1 h-[40px] border border-primary text-primary rounded-[8px] text-sm contain-paint cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                  Assign Loads
                </button>
              )}
            </div>
          </div>
        </div>
        <CreatePickupModal
          open={openPickupModal}
          onClose={() => setOpenPickupModal(false)}
        />
      </div>
    </Modal>
  );
};

export default EditDispatchModal;