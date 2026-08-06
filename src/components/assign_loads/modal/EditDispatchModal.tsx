import { Modal } from "@mui/material";
import axios from "axios";
import { X, Plus, Minus } from "lucide-react";
import CommonTextInput from "../../common/CommonTextInput";
import CommonSelectInput from "../../common/CommonSelectInput";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatePickupModal from "../../pickup/modal/CreatePickupModal";
import {
  getJobsApi,
  getMaterialsApi,
  createLoadApi,
  createDispatchApi,
  siteService,
  getLoadsByDispatchIdApi,
  updateDispatchColumnsApi,
} from "../../../services/auth.service";
import type { Job, CreateLoadPayload } from "../../../types/auth.types";
import dayjs from "dayjs";

interface EditDispatchModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  isEdit?: boolean;
  onOpenPickupModal?: () => void;
  onSuccess?: () => void;
  dispatchId?: string | null;
  loadDispatches?: any;
}

const initialFormData = {
  dispatchDate: "",
  customer: "",
  poCode: "", // holds jobId
  material: "",
  loads: "",
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
  onSuccess,
  dispatchId: editDispatchId,
  loadDispatches,
}: EditDispatchModalProps) => {
  const [columns, setColumns] = useState<number[]>(isEdit ? [1] : []);
  const [formData, setFormData] = useState(initialFormData);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loadsRef = useRef<HTMLInputElement>(null);
  // Dispatch that gets created the moment a date is picked
  const [dispatchId, setDispatchId] = useState<string | null>(null);
  const [editingLoadId, setEditingLoadId] = useState<string | null>(null);
  const [creatingDispatch, setCreatingDispatch] = useState(false);
  const [dispatchError, setDispatchError] = useState("");
  const [errors, setErrors] = useState({
    loads: false,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const [optionsLoading, setOptionsLoading] = useState(false);
  const [pickupSites, setPickupSites] = useState<any[]>([]);
  const [deliverySites, setDeliverySites] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadDispatch = async (dispatchId: string) => {
    const res = await getLoadsByDispatchIdApi(dispatchId);

    const load = res.data[0];

    setFormData({
      dispatchDate: dayjs(load.date).format("YYYY-MM-DD"),
      customer: resolveId(load.customerId),
      poCode: resolveId(load.jobId),
      material: resolveId(load.materialId),
      loads: String(load.numberOfTrips),
      invoiceRate: String(load.invoiceRate),
      contractorRate: String(load.contractorRate),
      pickup: resolveId(load.pickupSiteId),
      deliver: resolveId(load.deliverySiteId),
      startTime: load.startTime,
      endTime: load.endTime,
      comment: load.comment ?? "",
    });
    setDispatchId(load.dispatchId);
    setEditingLoadId(load._id ?? null);
    setColumns([1]);
  };

  useEffect(() => {
    if (!open || !isEdit || !editDispatchId) return;

    console.log("Calling API", editDispatchId);

    loadDispatch(editDispatchId);
  }, [open, isEdit, editDispatchId]);

  useEffect(() => {
    if (!open) return;

    setFormData(initialFormData);
    setColumns(isEdit ? [1] : []);
    setDispatchId(null);
    setDispatchError("");
  }, [open, isEdit]);

  useEffect(() => {
    if (!open) return;

    const loadOptions = async () => {
      setOptionsLoading(true);

      try {
        const [jobsRes, materialsRes, sitesRes] = await Promise.all([
          getJobsApi(1, 100),
          getMaterialsApi(1, 100),
          siteService.getSites({ limit: 100 }),
        ]);

        setJobs(jobsRes.data);
        setMaterials(materialsRes.data);

        const sites = sitesRes.data ?? [];

        setPickupSites(sites.filter((site: any) => site.type === "pickup"));

        setDeliverySites(sites.filter((site: any) => site.type === "deliver"));
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

  // Date select hote hi Dispatch create karo, uska _id state me rakho,
  // aur tabhi columns kholo.
  const handleDispatchDateChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, dispatchDate: value }));

    if (!value) {
      setDispatchId(null);
      setColumns([]);
      return;
    }

    setDispatchError("");
    setCreatingDispatch(true);
    try {
      const res = await createDispatchApi({ date: value });
      setDispatchId(res.data._id);
      loadDispatches?.();
      setColumns([1]);
    } catch (err) {
      console.error("Failed to create dispatch:", err);
      setDispatchError(
        "Failed to create dispatch for this date. Please try again.",
      );
      setDispatchId(null);
      setColumns([]);
      loadDispatches?.();
    } finally {
      setCreatingDispatch(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    if (field === "loads") {
      setErrors((prev) => ({
        ...prev,
        loads: false,
      }));
    }
    if (field === "poCode") {
      const job = jobs.find((j) => j._id === value);

      if (job) {
        const pickupSite =
          typeof job.pickupSiteId === "object" && job.pickupSiteId
            ? job.pickupSiteId
            : null;
        const deliverySite =
          typeof job.deliverySiteId === "object" && job.deliverySiteId
            ? job.deliverySiteId
            : null;

        if (pickupSite) addSiteOption(pickupSite);
        if (deliverySite) addSiteOption(deliverySite);

        setFormData((prev) => ({
          ...prev,
          poCode: value,
          customer: resolveId(job.customerId),
          material:
            typeof job.materialId === "object" && job.materialId
              ? job.materialId._id
              : "",
          pickup: resolveId(job.pickupSiteId),
          deliver: resolveId(job.deliverySiteId),
          invoiceRate: String(job.rate ?? ""),
          contractorRate: String(job.contractorRate ?? ""),
          loads: String(job.totalLoads ?? ""),
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

    // PO me material assigned hai
    if (job && typeof job.materialId === "object" && job.materialId) {
      return [
        {
          label: job.materialId.name,
          value: job.materialId._id,
        },
      ];
    }

    // PO me material nahi hai
    return materials.map((material) => ({
      label: material.name,
      value: material._id,
    }));
  }, [jobs, materials, formData.poCode]);

  const pickupOptions = useMemo(
    () =>
      pickupSites.map((site) => ({
        label: site.name,
        value: site._id,
      })),
    [pickupSites],
  );

  const deliveryOptions = useMemo(
    () =>
      deliverySites.map((site) => ({
        label: site.name,
        value: site._id,
      })),
    [deliverySites],
  );

  const addSiteOption = (site: any) => {
    if (!site || !site._id || !site.name || !site.type) return;

    if (site.type === "pickup") {
      setPickupSites((prev) =>
        prev.some((item) => item._id === site._id) ? prev : [...prev, site],
      );
    }

    if (site.type === "deliver") {
      setDeliverySites((prev) =>
        prev.some((item) => item._id === site._id) ? prev : [...prev, site],
      );
    }
  };

  const pickupSelectedLabel = useMemo(() => {
    if (!formData.pickup) return "";
    const option = pickupOptions.find((item) => item.value === formData.pickup);
    if (option) return option.label;

    const job = jobs.find((j) => j._id === formData.poCode);
    if (job && typeof job.pickupSiteId === "object" && job.pickupSiteId) {
      return job.pickupSiteId.name;
    }

    const site = pickupSites.find((item) => item._id === formData.pickup);
    return site?.name ?? "";
  }, [formData.pickup, formData.poCode, jobs, pickupOptions, pickupSites]);

  const deliverySelectedLabel = useMemo(() => {
    if (!formData.deliver) return "";
    const option = deliveryOptions.find(
      (item) => item.value === formData.deliver,
    );
    if (option) return option.label;

    const job = jobs.find((j) => j._id === formData.poCode);
    if (job && typeof job.deliverySiteId === "object" && job.deliverySiteId) {
      return job.deliverySiteId.name;
    }

    const site = deliverySites.find((item) => item._id === formData.deliver);
    return site?.name ?? "";
  }, [formData.deliver, formData.poCode, jobs, deliveryOptions, deliverySites]);

  const handleSubmit = async () => {
    const loads = Number(formData.loads);

    if (!formData.loads || loads <= 0) {
      setErrors({ loads: true });

      setTimeout(() => {
        loadsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        loadsRef.current?.focus();
      }, 0);

      return;
    }

    setErrors({
      loads: false,
    });

    if (!isFormValid || submitting) return;

    if (!dispatchId) {
      setDispatchError("Please select a dispatch date first.");
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
      startTime: formData.startTime,
      endTime: formData.endTime,
      comment: formData.comment || undefined,
    };

    setSubmitting(true);
    try {
      if (isEdit && dispatchId) {
        // Backend expects PUT /api/dispatches/:id/columns with columns array.
        // If editing existing load, include loadId so backend updates it instead of creating new.
        const columnsPayload: any[] = [
          {
            ...(editingLoadId ? { loadId: editingLoadId } : {}),
            numberOfTrips: Number(formData.loads) || 0,
            invoiceRate: parseAmount(formData.invoiceRate),
            contractorRate: parseAmount(formData.contractorRate),
            comment: formData.comment || undefined,
            jobId: formData.poCode || undefined,
            pickupSiteId: formData.pickup || undefined,
            deliverySiteId: formData.deliver || undefined,
          },
        ];

        await updateDispatchColumnsApi(dispatchId, columnsPayload);
      } else {
        await createLoadApi(payload);
      }

      loadDispatches?.();
      onSuccess?.();
      handleClose();
    } catch (err) {
      // If backend reports assignments exist for columns being removed, show friendly inline error
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "";
        if (
          typeof msg === "string" &&
          (msg.includes("already have an assignment") ||
            msg.includes("Cannot remove column"))
        ) {
          setDispatchError(
            "This load is already assigned to a driver. Unable to update the number of loads.",
          );
        } else {
          setDispatchError("Unable to update dispatch. Please try again.");
        }
      } else {
        setDispatchError("Unable to create/update load");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showError = (message: string) => {
    setDispatchError(message);

    setTimeout(() => {
      setDispatchError("");
    }, 3000);
  };

  const handleAddColumn = () => {
    if (!dispatchId) return;
    setColumns((prev) => [...prev, prev.length + 1]);
  };
  const handleRemoveColumn = () => {
    if (columns.length > 0) {
      setColumns((prev) => prev.slice(0, -1));
    }
  };

  const isFormValid =
    formData.dispatchDate.trim() !== "" &&
    !!dispatchId &&
    formData.customer.trim() !== "" &&
    formData.poCode.trim() !== "" &&
    formData.material.trim() !== "" &&
    formData.loads.trim() !== "" &&
    Number(formData.loads) >= 1 &&
    formData.invoiceRate.trim() !== "" &&
    formData.contractorRate.trim() !== "" &&
    formData.pickup.trim() !== "" &&
    formData.deliver.trim() !== "" &&
    formData.startTime.trim() !== "" &&
    formData.endTime.trim() !== "" &&
    columns.length > 0;

  const disableActions =
    !isFormValid || Number(formData.loads) <= 0 || submitting;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm max-h-[90dvh] flex flex-col overflow-hidden">
          <div className="shrink-0 px-3 py-3 xl:px-4 xl:py-3 flex items-start justify-between">
            <div>
              <h2 className="text-lg xl:text-xl font-normal text-black">
                {isEdit
                  ? (title ?? "Edit Dispatch")
                  : (title ?? "Create Dispatch")}
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
          {dispatchError && (
  <div className="mx-4 mt-3 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-sm font-medium text-red-600">
      {dispatchError}
    </p>

    <button
      type="button"
      onClick={() => setDispatchError("")}
      className="text-red-600 hover:text-red-800"
    >
      <X size={18} />
    </button>
  </div>
)}
          <div className="flex-1 overflow-y-auto px-4 xl:px-4 pb-3">
            <div className="mt-6">
              <CommonTextInput
                label="Dispatch Date"
                placeholder="mm/dd/yyyy"
                value={formData.dispatchDate}
                onChange={handleDispatchDateChange}
                type="date"
                min={tomorrowDate}
                max={tomorrowDate}
              />
              {creatingDispatch && (
                <p className="text-xs text-[#717182] mt-1">
                  Creating dispatch...
                </p>
              )}
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
                    disabled={optionsLoading}
                  />
                  <CommonSelectInput
                    label="Job ID# / PO Code"
                    value={formData.poCode}
                    onChange={handleChange("poCode")}
                    options={jobOptions}
                    disabled={optionsLoading}
                  />

                  <CommonSelectInput
                    label="Material"
                    value={formData.material}
                    onChange={handleChange("material")}
                    options={materialOptionsForSelectedJob}
                  />

                  <CommonTextInput
                    ref={loadsRef}
                    label="Number of Loads"
                    value={formData.loads}
                    onChange={handleChange("loads")}
                    placeholder="Enter"
                    error={errors.loads}
                  />

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
                    selectedLabelOverride={pickupSelectedLabel}
                    onChange={handleChange("pickup")}
                    options={pickupOptions}
                    addNewLabel="Add New"
                    onAddNew={onOpenPickupModal}
                    addNewMode="modal"
                    disabled={optionsLoading}
                  />

                  <CommonSelectInput
                    label="Deliver"
                    value={formData.deliver}
                    selectedLabelOverride={deliverySelectedLabel}
                    onChange={handleChange("deliver")}
                    options={deliveryOptions}
                    addNewLabel="Add New"
                    onAddNew={onOpenPickupModal}
                    addNewMode="modal"
                    disabled={optionsLoading}
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
                        onChange={(e) =>
                          handleChange("comment")(e.target.value)
                        }
                        className="w-full h-[120px] border-[0.85px] border-[#E5E7EB] rounded-[8px] p-2 md:p-4 resize-none outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm xl:text-base font-semibold">
                Columns:
              </span>

              <button
                onClick={handleAddColumn}
                disabled={!dispatchId}
                className={`w-7 h-7 rounded flex items-center justify-center text-white bg-[#22C55E]
                ${dispatchId ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
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
                disabled={disableActions || !dispatchId}
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
