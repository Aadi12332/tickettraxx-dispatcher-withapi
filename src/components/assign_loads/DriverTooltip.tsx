import { ArrowUpDown, X } from "lucide-react";

interface DriverTooltipProps {
  onClose: () => void;
  onRowClicked: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  drivers?: Array<{
    name?: string;
    truckId?: string | null;
    truckUnitNumber?: string | null;
  }>;
}

const DriverTooltip = ({
  onClose,
  onRowClicked,
  onMouseEnter,
  onMouseLeave,
  drivers = [],
}: DriverTooltipProps) => {
  const driverRows = drivers.filter((driver) => driver?.name);

  return (
    <div   onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave} className="absolute -top-1 left-0 z-99 w-[160px] bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="flex items-center justify-between py-3 px-2">
        <h3 className="font-normal text-xs">List of Drivers</h3>

        <button onClick={onClose} className="rounded-full border p-0.5 cursor-pointer">
          <X size={8} />
        </button>
      </div>

      <div className="grid grid-cols-2 px-2 py-2 border-y border-gray-100 bg-gray-200 text-[11px] font-medium">
        <span className="flex items-center gap-2">
          Driver <ArrowUpDown size={10} />
        </span>
        <span className="flex items-center justify-end gap-2">
          Truck ID <ArrowUpDown size={10} />
        </span>
      </div>
      <div className="max-h-[180px] overflow-y-auto">
        {driverRows.length === 0 ? (
          <div className="px-2 py-3 text-[10px] text-gray-500">
            No drivers available
          </div>
        ) : (
          driverRows.map((driver, index) => (
            <div
              key={`${driver.name}-${driver.truckId ?? index}`}
              onClick={onRowClicked}
              className="grid grid-cols-2 px-2 py-2 border-b border-gray-100 text-[10px] cursor-pointer"
            >
              <span>{driver.name}</span>
              <span className="flex items-center justify-end font-medium mr-2">
                {driver.truckUnitNumber ?? driver.truckId ?? "-"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default DriverTooltip;
