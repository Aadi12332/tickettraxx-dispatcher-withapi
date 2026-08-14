import { Modal } from "@mui/material";
import { X, Eye, EyeOff } from "lucide-react";
import CommonTextInput from "../common/CommonTextInput";
import CommonSelectInput from "../common/CommonSelectInput";
import { IOSSwitch } from "../common/Switch";
import CommonFileUpload from "../common/CommonFileUpload";
import CommonButton from "../common/CommonButton";
import { useState } from "react";
import { parkingLocationOptions, truckOptions } from "../../utils/data";
import CommonPhoneInput from "../common/CommonPhoneInput";
import axios from "axios";
import {
  createContractorApi,
  uploadContractorFilesApi,
} from "../../services/auth.service";

type ContractorEditData = {
  _id?: string;
  id?: string;
  companyName?: string;
  email?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  parkingLocation?: string;
  signatureDate?: string | null;
  expirationDate?: string | null;
  address?: string;
  idType?: string;
  idNumber?: string;
  phone?: string;
  contactName?: string;
  autoSendRenewalReminders?: boolean;
  usdotNumber?: string;
  txdotNumber?: string;
  ownerOperatorOrFleet?: string;
  payPercent?: number | string;
  truckCount?: number | string;
  countryCode?: string;
  contractDocument?: { url?: string };
  coiDocument?: { url?: string };
  dotInspectionDocument?: { url?: string };
  dotInspection?: { url?: string };
  ownerDriver?: { email?: string; phone?: string; name?: string };
  ownerTruck?: {
    unitNumber?: string;
    truckName?: string;
    year?: number | string;
    vinNumber?: string;
    plateNumber?: string;
    truckType?: string;
    insuranceExpiry?: string | number | Date;
    alias?: string | string[];
    dotInspectionDocument?: { url?: string };
  };
  trucks?: Array<{
    unitNumber?: string;
    truckName?: string;
    year?: number | string;
    vinNumber?: string;
    plateNumber?: string;
    truckType?: string;
    insuranceExpiry?: string | number | Date;
    alias?: string | string[];
    dotInspectionDocument?: { url?: string };
  }>;
  truck?: {
    unitNumber?: string;
    truckName?: string;
    year?: number | string;
    vinNumber?: string;
    plateNumber?: string;
    truckType?: string;
    insuranceExpiry?: string | number | Date;
    alias?: string | string[];
    dotInspectionDocument?: { url?: string };
  };
  contractorCode?: string;
};

interface ContractorModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: ContractorEditData | null;
  // Create/update successful hone ke baad parent ko batane ke liye, taaki list refresh ho sake
  onSuccess?: () => void;
}

const stateOptions = [
  "California",
  "Texas",
  "Florida",
  "New York",
  "Pennsylvania",
  "Illinois",
  "Ohio",
  "Georgia",
  "North Carolina",
  "Michigan",
].map((item) => ({
  label: item,
  value: item,
}));

const cityOptions = [
  { label: "Granite City", value: "Granite City" },
  { label: "Slate Town", value: "Slate Town" },
  { label: "Quartz Valley", value: "Quartz Valley" },
  { label: "Shale Springs", value: "Shale Springs" },
  { label: "Gravel Creek", value: "Gravel Creek" },
  { label: "Stoneport", value: "Stoneport" },
  { label: "Cobblestone Bay", value: "Cobblestone Bay" },
  { label: "Gemstone Valley", value: "Gemstone Valley" },
  { label: "Rockfield City", value: "Rockfield City" },
  { label: "Sandstone Harbor", value: "Sandstone Harbor" },
  { label: "Flintwood", value: "Flintwood" },
  { label: "Basalt Hills", value: "Basalt Hills" },
  { label: "Riverstone", value: "Riverstone" },
  { label: "Rocktop", value: "Rocktop" },
  { label: "Stonewood", value: "Stonewood" },
  { label: "Eaststone", value: "Eaststone" },
];

const normalizeIdType = (value?: string) => {
  if (!value) return "";

  const normalized = value.trim().toLowerCase();

  if (normalized.includes("license")) return "Driver License";
  if (normalized === "passport") return "Passport";
  if (normalized === "state id") return "State ID";
  if (normalized === "tax id") return "Tax ID";

  return value;
};

const idTypeOptions = [
  { label: "Driver License", value: "Driver License" },
  { label: "Passport", value: "Passport" },
  { label: "State ID", value: "State ID" },
  { label: "Tax ID", value: "Tax ID" },
];

type ContractorFormState = {
  companyName: string;
  contactName: string;
  email: string;
  password: string;
  contractPreview: string;
  coiPreview: string;
  zipCode: string;
  state: string;
  city: string;
  parkingLocation: string;
  usdot: string;
  txdot: string;
  ownerOperatorOrFleet: string;
  payPercent: string;
  truckOwnership: string;
  truckCount: string;
  truck_unitNumber: string;
  truck_truckName: string;
  truck_year: string;
  truck_vinNumber: string;
  truck_plateNumber: string;
  truck_truckType: string;
  truck_insuranceExpiry: string;
  truck_alias: string;
  signatureDate: string;
  expirationDate: string;
  address: string;
  contractFileName: string;
  coiFileName: string;
  idType: string;
  id: string;
  countryCode: string;
  phone: string;
  autoSendRenewalReminders: boolean;
  contractFile: File | null;
  coiFile: File | null;
  dotInspectionFile: File | null;
  dotInspectionPreview: string;
};

const initialForm: ContractorFormState = {
  companyName: "",
  contactName: "",
  email: "",
  password: "",
  contractPreview: "",
  coiPreview: "",
  zipCode: "",
  state: "",
  city: "",
  parkingLocation: "",

  usdot: "",
  txdot: "",
  ownerOperatorOrFleet: "",
  payPercent: "",
  truckOwnership: "",
  truckCount: "",

  truck_unitNumber: "",
  truck_truckName: "",
  truck_year: "",
  truck_vinNumber: "",
  truck_plateNumber: "",
  truck_truckType: "",
  truck_insuranceExpiry: "",
  truck_alias: "",

  signatureDate: "",
  expirationDate: "",
  address: "",
  contractFileName: "",
  coiFileName: "",
  idType: "",
  id: "",
  countryCode: "+1",
  phone: "",
  autoSendRenewalReminders: true,
  contractFile: null,
  coiFile: null,
  dotInspectionFile: null,
  dotInspectionPreview: "",
};

const getEditFormState = (
  editData: ContractorEditData | null | undefined,
): ContractorFormState => {
  if (!editData) return initialForm;

  const singleTruck =
    editData.ownerTruck ??
    (Array.isArray(editData.trucks) && editData.trucks.length > 0
      ? editData.trucks[0]
      : (editData.truck ?? null));

  const ownerDriver = editData.ownerDriver ?? null;

  return {
    ...initialForm,
    companyName: editData.companyName ?? "",
    email: editData.email ?? ownerDriver?.email ?? "",
    password: "",
    zipCode: editData.zipCode ?? "",
    state: editData.state ?? "",
    city: editData.city ?? "",
    parkingLocation: editData.parkingLocation ?? "",
    signatureDate: editData.signatureDate
      ? editData.signatureDate.slice(0, 10)
      : "",
    expirationDate: editData.expirationDate
      ? editData.expirationDate.slice(0, 10)
      : "",
    address: editData.address ?? "",
    idType: normalizeIdType(editData.idType),
    id: editData.idNumber ?? "",
    phone: ownerDriver?.phone ?? editData.phone ?? "",
    contactName: ownerDriver?.name ?? editData.contactName ?? "",
    autoSendRenewalReminders: editData.autoSendRenewalReminders ?? true,
    usdot: editData.usdotNumber ?? "",
    txdot: editData.txdotNumber ?? "",
    ownerOperatorOrFleet: editData.ownerOperatorOrFleet ?? "",
    payPercent:
      editData.payPercent !== undefined && editData.payPercent !== null
        ? String(editData.payPercent)
        : "",
    contractFileName: editData.contractDocument?.url ?? "",
    coiFileName: editData.coiDocument?.url ?? "",
    contractPreview: editData.contractDocument?.url ?? "",
    coiPreview: editData.coiDocument?.url ?? "",
    dotInspectionPreview:
      singleTruck?.dotInspectionDocument?.url ??
      editData.ownerTruck?.dotInspectionDocument?.url ??
      editData.dotInspectionDocument?.url ??
      editData.dotInspection?.url ??
      "",
    truckOwnership: Number(editData.truckCount) > 1 ? "multiple" : "single",
    truckCount: editData.truckCount ? String(editData.truckCount) : "",
    countryCode: editData.countryCode ?? "+1",
    truck_unitNumber: singleTruck?.unitNumber ?? "",
    truck_truckName: singleTruck?.truckName ?? "",
    truck_year: singleTruck?.year ? String(singleTruck.year) : "",
    truck_vinNumber: singleTruck?.vinNumber ?? "",
    truck_plateNumber: singleTruck?.plateNumber ?? "",
    truck_truckType: singleTruck?.truckType ?? "",
    truck_insuranceExpiry: singleTruck?.insuranceExpiry
      ? String(singleTruck.insuranceExpiry).slice(0, 10)
      : "",
    truck_alias: singleTruck?.alias
      ? Array.isArray(singleTruck.alias)
        ? singleTruck.alias.join(",")
        : String(singleTruck.alias)
      : "",
  };
};

const ContractorModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: ContractorModalProps) => {
  const [form, setForm] = useState<ContractorFormState>(() =>
    isEdit && editData ? getEditFormState(editData) : initialForm,
  );
const [cityOptionsState, setCityOptionsState] = useState(() =>
  editData?.city
    ? cityOptions.some((option) => option.value === editData.city)
      ? cityOptions
      : [
          ...cityOptions,
          {
            label: editData.city,
            value: editData.city,
          },
        ]
    : cityOptions
);

const [stateOptionsState, setStateOptionsState] = useState(() =>
  editData?.state
    ? stateOptions.some((option) => option.value === editData.state)
      ? stateOptions
      : [
          ...stateOptions,
          {
            label: editData.state,
            value: editData.state,
          },
        ]
    : stateOptions
);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Local calendar date 'YYYY-MM-DD' to prevent timezone shifts allowing previous UTC day
  const getLocalToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = getLocalToday();
  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setForm(initialForm);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!isFormValid) {
      setError("Please complete all fields before submitting.");
      return;
    }

    const rawPayload: Record<string, string | boolean | undefined> = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      phone: form.phone,
      email: form.email.trim(),
      password: form.password.trim() || undefined,
      parkingLocation: form.parkingLocation,
      zipCode: form.zipCode,
      state: form.state,
      city: form.city,
      signatureDate: form.signatureDate,
      expirationDate: form.expirationDate,
      address: form.address,
      idType: form.idType,
      idNumber: form.id,
      autoSendRenewalReminders: form.autoSendRenewalReminders,
      usdotNumber: form.usdot,
      txdotNumber: form.txdot,
      ownerOperatorOrFleet: form.ownerOperatorOrFleet,
      payPercent: form.payPercent.replace("%", ""),
      truckOwnership: form.truckOwnership,
      truckCount: form.truckOwnership === "single" ? "1" : form.truckCount,
      countryCode: form.countryCode,
    };

    const formData = new FormData();

    Object.entries(rawPayload).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // If single truck, include truck JSON payload
    if (form.truckOwnership === "single") {
      const truckObj: Record<string, string | string[] | undefined> = {
        unitNumber: form.truck_unitNumber || "",
        truckName: form.truck_truckName || "",
        year: form.truck_year || "",
        vinNumber: form.truck_vinNumber || "",
        plateNumber: form.truck_plateNumber || "",
        truckType: form.truck_truckType || "",
        insuranceExpiry: form.truck_insuranceExpiry || "",
        alias: form.truck_alias
          ? (JSON.parse(JSON.stringify(form.truck_alias)).split?.(",") ?? [
              form.truck_alias,
            ])
          : undefined,
      };

      // remove undefined/empty
      Object.keys(truckObj).forEach((k) => {
        if (truckObj[k] === undefined || truckObj[k] === "") delete truckObj[k];
      });

      formData.append("truck", JSON.stringify(truckObj));
    }

    if (form.contractFile) {
      formData.append("contract", form.contractFile);
    }

    if (form.coiFile) {
      formData.append("coi", form.coiFile);
    }

    if (form.dotInspectionFile) {
      formData.append("dotInspection", form.dotInspectionFile);
    }

    setLoading(true);
    try {
      if (isEdit && editData) {
        const contractorId = editData._id ?? editData.id;

        if (!contractorId) {
          setError("Contractor id is missing.");
          return;
        }

        await uploadContractorFilesApi(contractorId, formData);
      } else {
        await createContractorApi(formData);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        setError(
          data?.error?.message ||
            data?.message ||
            "Something went wrong. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  const isFormValid = Boolean(
    form.companyName.trim() &&
    form.email.trim() &&
    form.zipCode.trim() &&
    form.state.trim() &&
    form.city.trim() &&
    form.parkingLocation.trim() &&
    form.usdot.trim() &&
    form.txdot.trim() &&
    form.signatureDate.trim() &&
    form.expirationDate.trim() &&
    form.address.trim() &&
    form.idType.trim() &&
    form.id.trim() &&
    form.ownerOperatorOrFleet.trim() &&
    form.payPercent.trim() &&
    form.contactName.trim() &&
    (form.truckOwnership === "single" ? true : form.truckCount.trim()) &&
    (form.contractFile !== null || form.contractPreview.trim()) &&
    (form.coiFile !== null || form.coiPreview.trim()) &&
    form.countryCode.trim() &&
    form.phone.trim(),
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-9999">
        <div className="w-full max-w-150 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit Contractor" : "Add Contractor"}
              </h2>

              <p className="mt-1.5 text-sm text-[#717182]">
                {isEdit && editData?.contractorCode
                  ? `Contractor Code: ${editData.contractorCode}`
                  : "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
              </p>
            </div>

            <button onClick={handleClose} className="cursor-pointer">
              <X className="size-6 text-black" />
            </button>
          </div>

          {/* Form */}
          <div className=" pb-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 max-h-[55dvh] overflow-y-auto md:px-5 px-3">
              {/* Company Name + Primary Driver Name + Email — API ko required hain */}
              <div className="md:col-span-2">
                <CommonTextInput
                  label="Company Name"
                  value={form.companyName}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, companyName: value }))
                  }
                  placeholder="Enter company name..."
                />
              </div>

              <CommonTextInput
                label="Email"
                value={form.email}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, email: value }))
                }
                placeholder="Enter email..."
                name={isEdit ? "email" : "contractor-new-email"}
                autoComplete={isEdit ? "email" : "new-password"}
              />

              <CommonTextInput
                label="Password"
                value={form.password}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, password: value }))
                }
                placeholder={
                  isEdit
                    ? "Password cannot be changed here"
                    : "Enter password (optional for edit)"
                }
                type={showPassword ? "text" : "password"}
                rightIcon={
                  showPassword ? <EyeOff size={16} /> : <Eye size={16} />
                }
                onRightIconClick={() => setShowPassword((s) => !s)}
                disabled={isEdit}
                name={isEdit ? "password" : "contractor-new-password"}
                autoComplete="new-password"
              />

              {/* Name */}
              <div className="md:col-span-2">
                <CommonTextInput
                  label="Zip Code"
                  value={form.zipCode}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      zipCode: value,
                    }))
                  }
                  placeholder="Enter zip code..."
                />
              </div>

              <CommonSelectInput
                label="State"
                value={form.state}
                options={stateOptionsState}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    state: value,
                  }))
                }
                placeholder="Select one..."
                addNewLabel="+ Add New State"
                onAddNew={(stateName) => {
                  const newState = {
                    label: stateName,
                    value: stateName,
                  };

                  setStateOptionsState((prev) => [...prev, newState]);

                  setForm((prev) => ({
                    ...prev,
                    state: stateName,
                  }));
                }}
              />

              <CommonSelectInput
                label="City"
                value={form.city}
                options={cityOptionsState}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    city: value,
                  }))
                }
                addNewLabel="+ Add New City"
                onAddNew={(cityName) => {
                  const newCity = {
                    label: cityName,
                    value: cityName,
                  };

                  setCityOptionsState((prev) => [...prev, newCity]);

                  setForm((prev) => ({
                    ...prev,
                    city: cityName,
                  }));
                }}
              />

              <div className="md:col-span-2">
                <CommonSelectInput
                  label="Parking Location"
                  value={form.parkingLocation}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      parkingLocation: value,
                    }))
                  }
                  placeholder="Select one..."
                  options={parkingLocationOptions}
                />
              </div>

              <div>
                <CommonFileUpload
                  label="Upload Contract"
                  onChange={(file) => {
                    if (!file) return;

                    if (!allowedTypes.includes(file.type)) {
                      setError(
                        "Only PDF, JPG, JPEG and PNG files are allowed.",
                      );
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      contractFile: file,
                      contractPreview: URL.createObjectURL(file),
                    }));
                  }}
                />

                {form.contractPreview && (
                  <div className="mt-2">
                    {form.contractPreview.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={form.contractPreview}
                        className="w-full h-25 rounded border"
                      />
                    ) : (
                      <img
                        src={form.contractPreview}
                        alt="Contract"
                        className="w-full h-37.5 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <CommonFileUpload
                  label="Upload COI"
                  onChange={(file) => {
                    if (!file) return;

                    if (!allowedTypes.includes(file.type)) {
                      setError(
                        "Only PDF, JPG, JPEG and PNG files are allowed.",
                      );
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      coiFile: file,
                      coiPreview: URL.createObjectURL(file),
                    }));
                  }}
                />

                {form.coiPreview && (
                  <div className="mt-2">
                    {form.coiPreview.toLowerCase().endsWith(".pdf") ? (
                      <iframe
                        src={form.coiPreview}
                        className="w-full h-25 rounded border"
                      />
                    ) : (
                      <img
                        src={form.coiPreview}
                        alt="COI"
                        className="w-full h-37.5 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* USDOT + TxDOT */}
              <CommonTextInput
                label="USDOT"
                value={form.usdot}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    usdot: value,
                  }))
                }
                placeholder="Enter"
              />

              <CommonTextInput
                label="TxDOT"
                value={form.txdot}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    txdot: value,
                  }))
                }
                placeholder="Enter"
              />

              {/* Dates */}
              <CommonTextInput
                label="Signature Date"
                placeholder="mm/dd/yyyy"
                type="date"
                min={today}
                value={form.signatureDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    signatureDate: value,
                  }))
                }
              />

              <CommonTextInput
                label="Expiration Date"
                placeholder="mm/dd/yyyy"
                type="date"
                min={today}
                value={form.expirationDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    expirationDate: value,
                  }))
                }
              />

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-2">Address</label>
                <textarea
                  placeholder="Add Full Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full h-25 border-[0.85px] text-sm border-[#E5E7EB] rounded-lg p-2 md:p-4 resize-none outline-none"
                />
              </div>

              {/* ID Type + ID */}
              <CommonSelectInput
                label="ID Type"
                placeholder="Select one.."
                value={form.idType}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    idType: value,
                  }))
                }
                options={idTypeOptions}
              />

              <CommonTextInput
                label="ID"
                placeholder="Enter id..."
                value={form.id}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    id: value,
                  }))
                }
              />

              {/* Owner Operator / Fleet */}
              <CommonTextInput
                value={form.ownerOperatorOrFleet}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    ownerOperatorOrFleet: value,
                  }))
                }
                label="Owner Operator or Fleet"
                placeholder="Enter owner operator or fleet..."
              />
              <CommonPhoneInput
                label="Company Telephone"
                countryCode={form.countryCode}
                phone={form.phone}
                onCountryChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    countryCode: value,
                  }))
                }
                onPhoneChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: value,
                  }))
                }
              />

              {/* Pay Percentage */}
              <CommonTextInput
                label="Pay Percentage of Load"
                value={form.payPercent}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    payPercent: value,
                  }))
                }
                placeholder="Enter percentage..."
                isPercentage
              />

              <CommonTextInput
                label="Contact Name"
                value={form.contactName}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    contactName: value,
                  }))
                }
                placeholder="Enter"
              />
              {/* Trucks */}
              <CommonSelectInput
                label="Truck Ownership"
                value={form.truckOwnership}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    truckOwnership: value,
                  }))
                }
                options={truckOptions}
              />

              {form.truckOwnership === "multiple" && (
                <CommonTextInput
                  label="Enter Truck Count"
                  value={form.truckCount}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      truckCount: value,
                    }))
                  }
                  placeholder="e.g., 5"
                />
              )}

              {form.truckOwnership === "single" && (
                <>
                  <CommonTextInput
                    label="Unit Number"
                    value={form.truck_unitNumber}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_unitNumber: value }))
                    }
                    placeholder="e.g., TK-001"
                  />

                  <CommonTextInput
                    label="Truck Name"
                    value={form.truck_truckName}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_truckName: value }))
                    }
                    placeholder="e.g., Freightliner Cascadia"
                  />

                  <CommonTextInput
                    label="Year"
                    value={form.truck_year}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_year: value }))
                    }
                    placeholder="e.g., 2021"
                  />

                  <CommonTextInput
                    label="VIN Number"
                    value={form.truck_vinNumber}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_vinNumber: value }))
                    }
                    placeholder="Enter VIN"
                  />

                  <CommonTextInput
                    label="Plate Number"
                    value={form.truck_plateNumber}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_plateNumber: value }))
                    }
                    placeholder="Enter plate number"
                  />

                  <CommonTextInput
                    label="Truck Type"
                    value={form.truck_truckType}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_truckType: value }))
                    }
                    placeholder="e.g., Dump Truck"
                  />

                  <CommonTextInput
                    label="Insurance Expiry"
                    type="date"
                    min={today}
                    value={form.truck_insuranceExpiry}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        truck_insuranceExpiry: value,
                      }))
                    }
                  />

                  <CommonTextInput
                    label="Alias (comma separated)"
                    value={form.truck_alias}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, truck_alias: value }))
                    }
                    placeholder="e.g., Red Rig"
                  />

                  <div>
                    <CommonFileUpload
                      label="Upload DOT Inspection"
                      onChange={(file) => {
                        if (!file) return;

                        if (!allowedTypes.includes(file.type)) {
                          setError(
                            "Only PDF, JPG, JPEG and PNG files are allowed.",
                          );
                          return;
                        }

                        setForm((prev) => ({
                          ...prev,
                          dotInspectionFile: file,
                          dotInspectionPreview: URL.createObjectURL(file),
                        }));
                      }}
                    />

                    {form.dotInspectionPreview && (
                      <div className="mt-2">
                        {form.dotInspectionPreview
                          .toLowerCase()
                          .endsWith(".pdf") ? (
                          <iframe
                            src={form.dotInspectionPreview}
                            className="w-full h-25 rounded border"
                          />
                        ) : (
                          <img
                            src={form.dotInspectionPreview}
                            alt="DOT Inspection"
                            className="w-full h-37.5 object-cover rounded-lg border"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Auto Renewal */}
              <div className="md:col-span-2 flex items-center justify-between mt-2 mb-4">
                <label className="text-[16px] font-normal">
                  Auto Send Renewal Reminders
                </label>

                <IOSSwitch
                  checked={form.autoSendRenewalReminders}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      autoSendRenewalReminders: e.target.checked,
                    }))
                  }
                />
              </div>
            </div>

            {error && (
              <p className="px-5 mt-2 text-sm text-red-500 text-start">
                {error}
              </p>
            )}

            {/* Footer */}
            <div className="border-t px-5 border-[#E5E7EB] mt-2 pt-3 flex justify-end flex-wrap gap-1 md:gap-2 xl:gap-4">
              <CommonButton
                variant="primary"
                size="md"
                className="sm:flex-1"
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
              >
                {loading ? "Saving..." : isEdit ? "Save" : "Add Contractor"}
              </CommonButton>

              <CommonButton
                onClick={handleClose}
                variant="secondary"
                size="md"
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

export default ContractorModal;
