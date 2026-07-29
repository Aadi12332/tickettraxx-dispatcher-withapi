import {
  Drawer,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { RotateCcw, MapPin, Eye, X, Phone, Copy } from "lucide-react";
import { useState } from "react";
import CommonSelectInput from "../common/CommonSelectInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onShowToast?: (title: string) => void;
}

const CancelRerouteDrawer = ({ open, onClose, onShowToast }: Props) => {
  const [, setSelectedAction] = useState<"return" | "reroute" | null>(null);
const [newLocation, setNewLocation] = useState("");
const [showRemainingLoads, setShowRemainingLoads] = useState(false);
const handleActionClick = (title: string) => {
  onShowToast?.(title);
};

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1400 }}
      slotProps={{
        paper: {
          sx: {
            width: {
              xs: "100%",
              sm: 650,
              md: 650,
            },
            backgroundColor: "#fff",
          },
        },
      }}
    >
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-[#FFE2E2] px-4 md:px-6 py-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] rounded-full bg-[#B81029] flex items-center justify-center shrink-0 text-xl text-white">
              !
            </div>

            <div>
              <h2 className="text-sm md:text-base font-bold text-[#B81029]">
                Load Cancelled While In Transit
              </h2>

              <p className="text-xs text-[#7C7C7C] font-medium">
                Driver has picked up material (No signed ticket)
              </p>
            </div>
          </div>

          <button
            className="rounded-[5px] cursor-pointer border border-(--border-gray-2) bg-white w-[32px] h-[32px] flex items-center justify-center"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:gap-6">
              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Load ID</p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-xs md:text-sm">
                    #LD-78455
                  </span>

                  <Copy size={16} className="cursor-pointer" />
                </div>
              </div>

              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Customer</p>

                <p className="font-bold text-xs md:text-sm mt-1">
                  Celina Construction
                </p>
              </div>

              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Driver</p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-xs md:text-sm">
                    Robert Davis
                  </span>

                  <Phone size={16} />
                </div>
              </div>
            </div>

            <div className="border-t my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Pickup Location</p>

                <p className="font-bold text-xs md:text-sm mt-1">
                  Houston Plant
                </p>
              </div>

              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Delivery Location</p>

                <p className="font-bold text-xs md:text-sm mt-1">
                  Lakeside Project
                </p>
              </div>

              <div className="border-r border-gray-200">
                <p className="text-gray-500 text-xs">Picked Up At</p>

                <p className="font-bold text-xs md:text-sm mt-1">
                  May 12, 2026
                </p>

                <p className="text-sm">08:15 AM</p>
              </div>

              <div>
                <p className="text-gray-500 text-xs">Ticket Status</p>

                <span className="inline-flex mt-2 px-3 py-1.5 rounded-full bg-[#FFE7E7] text-[#C8102E] text-xs font-semibold">
                  Not Signed
                </span>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <h3 className="mt-5 mb-3 text-xs md:text-sm text-[#666] font-normal uppercase">
            Choose how you want to proceed with this load.
          </h3>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Return to Pickup */}
            <div
              onClick={() => setSelectedAction("return")}
              className="border border-[#D38C1F] rounded-xl bg-[#FEFBF4] p-4 flex flex-col cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <RotateCcw size={18} className="text-[#D99018] shrink-0" />

                <h4 className="font-bold text-xs md:text-sm text-[#D99018]">
                  A. Return to Pickup Location
                </h4>
              </div>

              <ul className="space-y-2 mb-4 text-xs md:text-sm">
                <li>▶ Driver returns material to pickup location</li>
                <li>▶ Rate will be set to 50% automatically</li>
              </ul>

              <div className="bg-[#F8F1E3] rounded-xl p-4 border border-[#E9DEC9]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Original Rate</p>

                    <p className="text-sm font-medium mt-1">$10.00</p>
                  </div>

                  <div className="text-sm font-bold">→</div>

                  <div>
                    <p className="text-xs text-gray-500">Return Rate (50%)</p>

                    <p className="text-sm font-bold mt-1">$05.00</p>
                  </div>
                </div>
              </div>

              <button type="button"
                 onClick={() => {
  if (!showRemainingLoads) {
    setSelectedAction("return");
    setShowRemainingLoads(true);
    return;
  }

  handleActionClick(
    "You successfully sent the reminder to return to the pickup location."
  );
}}
                className="mt-5 lg:mt-auto w-full h-10 rounded-lg bg-[#D99018] text-white text-sm font-semibold hover:opacity-90 cursor-pointer"
              >
                Confirm Return to Pickup
              </button>
        
            </div>

            {/* Reroute */}
            <div className="border border-[#3148CD] bg-[#F6F9FE] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={18} className="text-[#3148CD] shrink-0" />

                <h4 className="font-bold text-xs md:text-sm text-[#3148CD]">
                  B. Reroute to Another Location
                </h4>
              </div>

              <p className="text-sm mb-2">
                ▶ Reroute driver to a different delivery
              </p>

              <p className="text-sm mb-4">
                ▶ Ticket must be updated at scalehouse
              </p>

             <CommonSelectInput
  label="New Delivery Location"
  value={newLocation}
  placeholder="Select new location"
  onChange={setNewLocation}
  options={[
    { label: "Sunnyvale.", value: "Sunnyvale" },
    { label: "Maplewood.", value: "Maplewood" },
    { label: "Riverton.", value: "Riverton" },
    { label: "Crestview.", value: "Crestview" },
    { label: "Brookfield.", value: "Brookfield" },
  ]}
/>

              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked
                    size="small"
                    style={{ color: "#3148CD" }}
                  />
                }
                label="Force ticket update before next load"
                sx={{
                  display: "block",
                  mb: 0.5,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "14px",
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked
                    size="small"
                    style={{ color: "#3148CD" }}
                  />
                }
                label="Lock next load selection"
                sx={{
                  display: "block",
                  "& .MuiFormControlLabel-label": {
                    fontSize: "14px",
                  },
                }}
              />

              <button type="button"
               onClick={() =>
    handleActionClick(
      "You successfully sent the reroute request"
    )
  }
                className="w-full h-10 mt-4 rounded-lg bg-[#3452F1] text-white text-sm font-semibold hover:opacity-90 cursor-pointer"
              >
                Send Reroute Request
              </button>
            </div>
          </div>

          {showRemainingLoads && (
            <div className="mt-6 border border-gray-200 rounded-[10px] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#D99018] font-medium text-base">
                  Remaining Loads
                </h3>

                <button className="text-[#2583F6] font-medium text-sm">
                  Select All
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "#64657",
                    pickup: "Sunnyvale Park",
                    delivery: "Greenwood Station",
                  },
                  {
                    id: "#87631",
                    pickup: "Sunnyvale Park",
                    delivery: "Greenwood Station",
                  },
                  {
                    id: "#34674",
                    pickup: "Sunnyvale Park",
                    delivery: "Maplewood Plaza",
                  },
                ].map((load) => (
                  <div
                    key={load.id}
                    className="grid sm:grid-cols-[20px_1fr_1fr_1fr] sm:gap-6 gap-2 items-start"
                  >
                    <input type="checkbox" className="mt-1 w-4 h-4" />

                    <div className="flex flex-col items-start">
                      <p className="text-[#7A7A7A] text-sm">Load ID:</p>
                      <p className="font-medium">{load.id}</p>
                    </div>

                    <div className="flex flex-col items-start">
                      <p className="text-[#7A7A7A] text-sm">Pickup:</p>
                      <p className="font-medium">{load.pickup}</p>
                    </div>

                    <div className="flex flex-col items-start">
                      <p className="text-[#7A7A7A] text-sm">Delivery:</p>
                      <p className="font-medium">{load.delivery}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Notify Driver */}
          <div className="mt-4 border border-gray-200 rounded-[10px] p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Notify Driver</p>

              <p className="font-semibold text-sm md:text-base">
                Driver will receive a notification with this update.
              </p>
            </div>

            <button className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50">
              <Eye size={16} />
              Preview Message
            </button>
          </div>

          {/* Note */}
          <div className="mt-4 bg-[#F6F4FE] border border-[#DDD6FE] rounded-[10px] p-4">
            <p className="text-sm text-[#7E00D2]">
              Note: All actions and communications will be logged in the system.
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CancelRerouteDrawer;
