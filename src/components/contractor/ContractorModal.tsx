import { Modal } from "@mui/material";
import { X } from "lucide-react";
import CommonTextInput from "../common/CommonTextInput";
import CommonSelectInput from "../common/CommonSelectInput";
import { IOSSwitch } from "../common/Switch";
import CommonFileUpload from "../common/CommonFileUpload";
import CommonButton from "../common/CommonButton";
import { useEffect, useState } from "react";
import { parkingLocationOptions, truckOptions } from "../../utils/data";
import CommonPhoneInput from "../common/CommonPhoneInput";
import axios from "axios";
import {
  createContractorApi,
  updateContractorApi,
} from "../../services/auth.service";
import type { Contractor } from "../../types/auth.types";

interface ContractorModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editData?: Contractor | null;
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

const idTypeOptions = [
  { label: "Driver License", value: "Driver License" },
  { label: "Passport", value: "Passport" },
  { label: "State ID", value: "State ID" },
  { label: "Tax ID", value: "Tax ID" },
];

const initialForm = {
  companyName: "",
  primaryDriverName: "",
  unitNumber: "",
  email: "",

  zipCode: "",
  state: "",
  city: "",
  parkingLocation: "",

  usdot: "",
  txdot: "",

  signatureDate: "",
  expirationDate: "",
  address: "",

  idType: "",
  id: "",
  ownerOperatorFleet: "",
  phoneCode: "+1",
  companyTelephone: "",
  payPercentage: "",
  contactName: "",
  unit: "",
  trucks: "",
  autoRenewal: true,
  truckCount: "",
  contractFile: null as File | null,
  coiFile: null as File | null,
};

const ContractorModal = ({
  open,
  onClose,
  isEdit = false,
  editData,
  onSuccess,
}: ContractorModalProps) => {
  const [form, setForm] = useState(initialForm);
  const [cityOptionsState, setCityOptionsState] = useState(cityOptions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setForm(initialForm);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.companyName.trim() || !form.primaryDriverName.trim() || !form.email.trim()) {
      setError("Please fill company name, driver name and email");
      return;
    }

    // Files JSON body me nahi bheji ja sakti (multipart upload chahiye), baaki sab fields bhej rahe hain
    const payload = {
      companyName: form.companyName.trim(),
      primaryDriverName: form.primaryDriverName.trim(),
      unitNumber: form.unit,
      email: form.email.trim(),
      parkingLocation: form.parkingLocation,
      zipCode: form.zipCode,
      state: form.state,
      city: form.city,
      usdot: form.usdot,
      txdot: form.txdot,
      signatureDate: form.signatureDate,
      expirationDate: form.expirationDate,
      address: form.address,
      idType: form.idType,
      idNumber: form.id,
      ownerOperatorFleet: form.ownerOperatorFleet,
      phoneCode: form.phoneCode,
      companyTelephone: form.companyTelephone,
      payPercentage: form.payPercentage,
      contactName: form.contactName,
      trucks: form.trucks,
      truckCount: form.truckCount,
      autoRenewal: form.autoRenewal,
    };

    setLoading(true);
    try {
      if (isEdit && editData) {
        await updateContractorApi(editData._id, payload);
      } else {
        await createContractorApi(payload);
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

  useEffect(() => {
    if (!open) return;

    if (isEdit && editData) {
      setForm({
        ...initialForm,
        companyName: editData.companyName ?? "",
        primaryDriverName: editData.primaryDriverName ?? "",
        unit: editData.unitNumber ?? "",
        email: editData.email ?? "",
        zipCode: editData.zipCode ?? "",
        state: editData.state ?? "",
        city: editData.city ?? "",
        parkingLocation: editData.parkingLocation ?? "",
        usdot: editData.usdot ?? "",
        txdot: editData.txdot ?? "",
        signatureDate: editData.signatureDate ?? "",
        expirationDate: editData.expirationDate ?? "",
        address: editData.address ?? "",
        idType: editData.idType ?? "",
        id: editData.idNumber ?? "",
        ownerOperatorFleet: editData.ownerOperatorFleet ?? "",
        phoneCode: editData.phoneCode ?? "+1",
        companyTelephone: editData.companyTelephone ?? "",
        payPercentage: editData.payPercentage ?? "",
        contactName: editData.contactName ?? "",
        trucks: editData.trucks ?? "",
        truckCount: editData.truckCount ?? "",
        autoRenewal: editData.autoRenewal ?? true,
      });
    } else {
      setForm(initialForm);
    }
    setError("");
  }, [open, isEdit, editData]);

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit Contractor" : "Add Contractor"}
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
                label="Primary Driver Name"
                value={form.primaryDriverName}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, primaryDriverName: value }))
                }
                placeholder="Enter driver name..."
              />

              <CommonTextInput
                label="Email"
                value={form.email}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, email: value }))
                }
                placeholder="Enter email..."
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

              {/* State + City */}
              <CommonSelectInput
                label="State"
                value={form.state}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    state: value,
                  }))
                }
                placeholder="Select one..."
                options={stateOptions}
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
              {/* Upload */}
              <CommonFileUpload
                label="Upload Contract"
                onChange={(file) =>
                  setForm((prev) => ({ ...prev, contractFile: file }))
                }
              />
              <CommonFileUpload
                label="Upload COI"
                onChange={(file) =>
                  setForm((prev) => ({ ...prev, coiFile: file }))
                }
              />

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
                <label className="block text-sm xl:text-base mb-2">
                  Address
                </label>
                <textarea
                  placeholder="Add Full Address"
                  value={form.address}
                  onChange={(e: any) =>
                    setForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full h-[100px] border-[0.85px] text-sm border-[#E5E7EB] rounded-[8px] p-2 md:p-4 resize-none outline-none"
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

              {/* Company */}
              <CommonTextInput
                value={form.ownerOperatorFleet}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    ownerOperatorFleet: value,
                  }))
                }
                label="Owner Operator or Fleet"
                placeholder="Enter owner operator or fleet..."
              />
              <CommonPhoneInput
                label="Company Telephone"
                countryCode={form.phoneCode}
                phone={form.companyTelephone}
                onCountryChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    phoneCode: value,
                  }))
                }
                onPhoneChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    companyTelephone: value,
                  }))
                }
              />

              <CommonTextInput
                label="Pay Percentage of Load"
                value={form.payPercentage}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    payPercentage: value,
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
              <CommonTextInput
                label="#Unit"
                value={form.unit}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    unit: value,
                  }))
                }
                placeholder="Enter"
              />
              {/* Trucks */}
              <CommonSelectInput
                label="How Many Trucks Do You Have?"
                value={form.trucks}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    trucks: value,
                  }))
                }
                options={truckOptions}
              />

              {form.trucks === "multiple" && (
                <CommonTextInput
                  label="Enter Truck Number"
                  value={form.truckCount}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      truckCount: value,
                    }))
                  }
                  placeholder="e.g., 3"
                />
              )}

              {/* Auto Renewal */}
              <div className="md:col-span-2 flex items-center justify-between mt-2 mb-4">
                <label className="text-[16px] font-normal">
                  Auto Send Renewal Reminders
                </label>

                <IOSSwitch
                  checked={form.autoRenewal}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      autoRenewal: e.target.checked,
                    }))
                  }
                />
              </div>
            </div>

            {error && (
              <p className="px-5 mt-2 text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Footer */}
            <div className="border-t px-5 border-[#E5E7EB] mt-2 pt-3 flex justify-end flex-wrap gap-1 md:gap-2 xl:gap-4">
              <CommonButton
                variant="primary"
                size="md"
                className="sm:flex-1"
                onClick={handleSubmit}
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