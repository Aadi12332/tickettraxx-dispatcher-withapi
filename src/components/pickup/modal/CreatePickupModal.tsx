import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import CommonSelectInput from "../../common/CommonSelectInput";
import CommonButton from "../../common/CommonButton";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  thirdPartyCustomerOptions,
  pickupOptions,
  deliveryOptions,
} from "../../../utils/data";
import type { Site, SiteType } from "../../../types/auth.types";
import { siteService, getContractorsApi } from "../../../services/auth.service";

interface OptionType {
  label: string;
  value: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });

  return null;
}

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

interface CreatePickupModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editingSite?: Site | null;
  onSuccess?: () => void;
}

const defaultMarkerPos: [number, number] = [49.102, -122.658];

const initialFormData = {
  type: "",
  location: "",
  customer: "",
  contractorRate: "",
  invoiceRate: "",
  thirdPartyCustomer: "",
};

const CreatePickupModal = ({
  open,
  onClose,
  isEdit = false,
  editingSite = null,
  onSuccess,
}: CreatePickupModalProps) => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [newThirdPartyCustomer, setNewThirdPartyCustomer] = useState("");
  const [contractorOptions, setContractorOptions] = useState<OptionType[]>([]);
  const [markerPos, setMarkerPos] =
    useState<[number, number]>(defaultMarkerPos);

  const lastChangeFromMap = useRef(false);
  const geocodeRequestId = useRef(0);

  const loadContractors = async () => {
  try {
    const res = await getContractorsApi(1, 100);

    setContractorOptions(
      res.data.map((contractor) => ({
        label: contractor.companyName,
        value: contractor._id,
      }))
    );
  } catch (err) {
    console.error("Failed to load contractors", err);
  }
};

useEffect(() => {
  if (open) {
    loadContractors();
  }
}, [open]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && editingSite) {
      setFormData({
        type: editingSite.type === "pickup" ? "Pickup" : "Deliver",
        location: editingSite.name,
        customer: editingSite.customerId?._id || "",
        contractorRate: String(editingSite.contractorRate ?? ""),
        invoiceRate: String(editingSite.invoiceRate ?? ""),
        thirdPartyCustomer: "",
      });
    } else {
      setFormData(initialFormData);
    }

    setMarkerPos(defaultMarkerPos);
    lastChangeFromMap.current = false;
    setSubmitError("");
  }, [open, isEdit, editingSite]);

  // Whenever the location value changes via the dropdown (not from a map
  // click), geocode the selected address text so the marker/map reflects it.
  useEffect(() => {
    if (!formData.location) return;
    if (lastChangeFromMap.current) {
      lastChangeFromMap.current = false;
      return;
    }

    const requestId = ++geocodeRequestId.current;
console.log(newThirdPartyCustomer)
    const geocodeLocation = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            formData.location,
          )}`,
        );

        const data = await response.json();

        if (requestId !== geocodeRequestId.current) return;

        const result = data?.[0];

        if (result?.lat && result?.lon) {
          setMarkerPos([parseFloat(result.lat), parseFloat(result.lon)]);
        }
      } catch {
        // Geocoding failed — keep marker where it is
      }
    };

    void geocodeLocation();
  }, [formData.location]);

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    if (field === "location") {
      lastChangeFromMap.current = false;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClose = () => {
    setSubmitError("");
    onClose();
  };

  const isFormValid = useMemo(() => {
    return (
      formData.type.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.customer.trim() !== ""
    );
  }, [formData]);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError("");

const siteType: SiteType =
  formData.type.toLowerCase() === "pickup"
    ? "pickup"
    : "deliver";

    try {
      const basePayload = {
        type: siteType,
        name: formData.location,
        customerId: formData.customer || "",
        contractorId: formData.customer || undefined,
        thirdPartyCustomerId: formData.thirdPartyCustomer || undefined,
        address: formData.location,
        lat: markerPos[0],
        lng: markerPos[1],
        contractorRate: Number(formData.contractorRate) || 0,
        invoiceRate: Number(formData.invoiceRate) || 0,
      };

      if (isEdit && editingSite) {
        await siteService.updateSite(editingSite._id, basePayload);
      } else {
        await siteService.createSite(basePayload);
      }

      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save pickup/deliver.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMapClick = async (e: any) => {
    const { lat, lng } = e.latlng;

    lastChangeFromMap.current = true;
    setMarkerPos([lat, lng]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );

      const data = await response.json();

      if (data?.display_name) {
        setFormData((prev) => ({
          ...prev,
          location: data.display_name,
        }));
      }
    } catch {
      setFormData((prev) => ({
        ...prev,
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999]">
        <div className="w-full max-w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-3 pt-4 pb-4 flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-normal text-black">
                {isEdit ? "Edit Pickup/Deliver" : "Create Pickup/Deliver"}
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
          <div className="px-3 pb-4 mt-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 gap-y-4">
              <CommonSelectInput
                label="Type"
                value={formData.type}
                placeholder="Select one..."
                onChange={handleChange("type")}
                options={[
                  {
                    label: "Pickup",
                    value: "Pickup",
                  },
                  {
                    label: "Deliver",
                    value: "Deliver",
                  },
                ]}
              />

              <CommonSelectInput
                label={formData.type || "Location"}
                value={formData.location}
                placeholder="Select one..."
                onChange={handleChange("location")}
                options={
                  formData.type?.toLowerCase() === "pickup"
                    ? pickupOptions
                    : deliveryOptions
                }
                addNewLabel="Add New"
                onAddNew={() => {}}
              />

              {formData.type && (
                <>
                  <div>
                    <label className="block text-base font-normal text-black mb-3">
                      GPS Location
                    </label>

                    <div className="border border-[#E5E7EB] rounded-[12px] overflow-hidden">
                      <div className="h-[150px]">
                        <MapContainer
                          center={markerPos}
                          zoom={13}
                          scrollWheelZoom={false}
                          className="w-full h-full"
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                          <Marker position={markerPos} />

                          <MapRecenter position={markerPos} />

                          <MapClickHandler onMapClick={handleMapClick} />
                        </MapContainer>
                      </div>
                    </div>
                  </div>

                  <CommonSelectInput
  label="Contractor's Name"
  value={formData.customer}
  placeholder="Select one..."
  onChange={handleChange("customer")}
  options={contractorOptions}
/>

                  <CommonSelectInput
                    label="Third Party Customer (if any)"
                    value={formData.thirdPartyCustomer}
                    placeholder="Select one..."
                    onChange={(value) => {
                      setNewThirdPartyCustomer("");
                      handleChange("thirdPartyCustomer")(value);
                    }}
                    options={thirdPartyCustomerOptions}
                    addNewLabel="Add New"
                    onAddNew={(value) => {
                      setNewThirdPartyCustomer(value);

                      setFormData((prev) => ({
                        ...prev,
                        thirdPartyCustomer: value,
                      }));
                    }}
                  />
                </>
              )}
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-red-500">{submitError}</p>
            )}

            {/* Footer */}
            <div className="border-t border-[#E5E7EB] mt-8 pt-5 flex justify-center flex-wrap gap-4">
              <CommonButton
                size="md"
                variant="primary"
                icon={!isEdit ? <Plus size={18} /> : undefined}
                onClick={handleSubmit}
                className={`sm:flex-1 ${
                  !isFormValid || submitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {submitting
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save"
                    : "Create Pickup/Deliver"}
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

export default CreatePickupModal;
