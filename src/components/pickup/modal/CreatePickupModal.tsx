import { Modal } from "@mui/material";
import { X, Plus } from "lucide-react";
import CommonSelectInput from "../../common/CommonSelectInput";
import CommonButton from "../../common/CommonButton";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  thirdPartyCustomerOptions,
  pickupOptions,
  deliveryOptions,
} from "../../../utils/data";
import type { Site, SiteType } from "../../../types/auth.types";
import { siteService, getContractorsApi } from "../../../services/auth.service";
import { loadGoogleMapsApi } from "../../../utils/googleMaps";

interface OptionType {
  label: string;
  value: string;
}

interface CreatePickupModalProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  editingSite?: Site | null;
  onSuccess?: () => void;
}

const defaultMarkerPos: [number, number] = [49.102, -122.658];

interface FormData {
  type: string;
  location: string;
  isCustomLocation: boolean;
  address: string;
  customer: string;
  contractorRate: string;
  invoiceRate: string;
  thirdPartyCustomer: string;
}

const initialFormData: FormData = {
  type: "",
  location: "",
  address: "",
  customer: "",
  contractorRate: "",
  invoiceRate: "",
  thirdPartyCustomer: "",
  isCustomLocation: false,
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
  const [contractorOptions, setContractorOptions] = useState<OptionType[]>([]);
  const [markerPos, setMarkerPos] =
    useState<[number, number]>(defaultMarkerPos);

  const lastChangeFromMap = useRef(false);
  const geocodeRequestId = useRef(0);
  const googleMapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const geocoderInstance = useRef<any>(null);
  const mapClickListener = useRef<any>(null);

  const handleMapClick = (lat: number, lng: number) => {
    lastChangeFromMap.current = true;
    setMarkerPos([lat, lng]);

    const google = (window as any).google;
    const geocoder =
      geocoderInstance.current ||
      (google?.maps ? new google.maps.Geocoder() : null);

    if (geocoder) {
      geocoderInstance.current = geocoder;
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any, status: string) => {
          if (status === "OK" && results?.[0]?.formatted_address) {
            setFormData((prev) => ({
              ...prev,
              address: results[0].formatted_address,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            }));
          }
        },
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
    }
  };

  const initializeMap = (google: any) => {
    if (!google?.maps || !googleMapRef.current || mapInstance.current) {
      return !!mapInstance.current;
    }

    const map = new google.maps.Map(googleMapRef.current, {
      center: { lat: markerPos[0], lng: markerPos[1] },
      zoom: 13,
      disableDefaultUI: true,
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(current);

        markerInstance.current.setPosition(current);

        setMarkerPos([current.lat, current.lng]);
      });
    }

    mapInstance.current = map;
    markerInstance.current = new google.maps.Marker({
      map,
      position: { lat: markerPos[0], lng: markerPos[1] },
    });

    mapClickListener.current = map.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      handleMapClick(lat, lng);
    });

    geocoderInstance.current = new google.maps.Geocoder();
    return true;
  };

  const loadContractors = async () => {
    try {
      const res = await getContractorsApi(1, 100);

      setContractorOptions(
        res.data.map((contractor) => ({
          label: contractor.companyName,
          value: contractor._id,
        })),
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
        address: editingSite.address ?? "",
        customer: editingSite.customerId?._id || "",
        contractorRate: String(editingSite.contractorRate ?? ""),
        invoiceRate: String(editingSite.invoiceRate ?? ""),
        thirdPartyCustomer: "",
        isCustomLocation: false,
      });
    } else {
      setFormData(initialFormData);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPos([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setMarkerPos(defaultMarkerPos);
        },
      );
    } else {
      setMarkerPos(defaultMarkerPos);
    }
    lastChangeFromMap.current = false;
    setSubmitError("");
  }, [open, isEdit, editingSite]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let resizeTimer: number | undefined;

    loadGoogleMapsApi()
      .then((google) => {
        if (cancelled) return;

        setTimeout(() => {
          initializeMap(google);
        }, 300);

        if (google?.maps && mapInstance.current) {
          google.maps.event.trigger(mapInstance.current, "resize");
          mapInstance.current.setCenter({
            lat: markerPos[0],
            lng: markerPos[1],
          });
        }

        resizeTimer = window.setTimeout(() => {
          if (google?.maps && mapInstance.current) {
            google.maps.event.trigger(mapInstance.current, "resize");
            mapInstance.current.setCenter({
              lat: markerPos[0],
              lng: markerPos[1],
            });
          }
        }, 200);
      })
      .catch((error) => {
        console.error("Google Maps load failed:", error);
      });

    return () => {
      cancelled = true;
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, [open, markerPos]);

  useEffect(() => {
    if (!markerInstance.current || !mapInstance.current) return;

    const position = {
      lat: markerPos[0],
      lng: markerPos[1],
    };

    markerInstance.current.setPosition(position);
    mapInstance.current.panTo(position);
  }, [markerPos]);

  useEffect(() => {
    if (!open) return;
    if (!formData.location) return;
    if (lastChangeFromMap.current) {
      lastChangeFromMap.current = false;
      return;
    }

    loadGoogleMapsApi()
      .then((google) => {
        if (!google?.maps) return;

        const geocoder = geocoderInstance.current || new google.maps.Geocoder();
        geocoderInstance.current = geocoder;

        const requestId = ++geocodeRequestId.current;

        geocoder.geocode(
          { address: formData.location },
          (results: any, status: string) => {
            if (requestId !== geocodeRequestId.current) return;
            if (status === "OK" && results?.length > 0) {
              const loc = results[0].geometry.location;

              setMarkerPos([loc.lat(), loc.lng()]);

              setFormData((prev) => ({
                ...prev,
                address: results[0].formatted_address,
              }));
            }
          },
        );
      })
      .catch((error) => {
        console.error("Google Maps geocode failed:", error);
      });
  }, [formData.location, open]);

  // Type + name (location) hi zaroori hain — customer/rates is form se bhejenge nahi,
  // isliye unhe required validation se hata diya (pehle button isi wajah se hamesha
  // disabled rehta tha, kyunki contractorRate/invoiceRate ke liye koi input hi nahi tha)
  const isFormValid = useMemo(
    () => !!formData.type && !!formData.location,
    [formData],
  );

const handleClose = () => {
  onClose();

  mapInstance.current = null;
  markerInstance.current = null;
  geocoderInstance.current = null;

  if (mapClickListener.current) {
    mapClickListener.current.remove();
    mapClickListener.current = null;
  }

  setFormData(initialFormData);
  setMarkerPos(defaultMarkerPos);
  setSubmitError("");
};

  const handleChange =
    (field: keyof typeof initialFormData) => (value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const siteType: SiteType =
        formData.type.toLowerCase() === "pickup" ? "pickup" : "deliver";

      // customerId/contractorRate/invoiceRate is quick-add flow se nahi bhejte —
      // name = jo type/select kiya, address/lat/lng = map se
      const basePayload = {
        type: siteType,
        name: formData.location,
        contractorId: formData.customer || undefined,
        thirdPartyCustomerId: formData.thirdPartyCustomer || undefined,
        address: formData.address,
        lat: markerPos[0],
        lng: markerPos[1],
      };

      if (isEdit && editingSite) {
        await siteService.updateSite(editingSite._id, basePayload as any);
      } else {
        await siteService.createSite(basePayload as any);
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

              {formData.type && !formData.isCustomLocation && (
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
                  onAddNew={() => {
                    setFormData((prev) => ({
                      ...prev,
                      isCustomLocation: true,
                      location: "",
                    }));
                  }}
                />
              )}

              {formData.isCustomLocation && (
                <div>
                  <label className="block text-sm font-normal text-black mb-3">
                    {formData.type || "Location"}
                  </label>

                  <input
                    className="w-full h-12 rounded-lg border border-[#E5E7EB] px-3"
                    placeholder="Enter location name"
                    value={formData.location}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData((prev) => ({
                        ...prev,
                        location: value,
                        isCustomLocation: value.trim().length > 0,
                      }));
                    }}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-normal text-black mb-3">
                  GPS Location
                </label>

                <div className="border border-[#E5E7EB] rounded-[12px] overflow-hidden">
                  <div className="h-[150px]">
                    <div ref={googleMapRef} className="w-full h-full" />
                  </div>
                </div>
              </div>

              {formData.type && (
                <>
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
                    onChange={handleChange("thirdPartyCustomer")}
                    options={thirdPartyCustomerOptions}
                    addNewLabel="Add New"
                    onAddNew={(value) => {
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
