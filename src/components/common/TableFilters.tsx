import { Search, Calendar1, SlidersHorizontal } from "lucide-react";
import CommonFilterDropdown from "./CommonFilterDropdown";

interface TableFiltersProps {
  period?: string;
  onPeriodChange?: (value: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  dateRange?: string;
  onDateClick?: () => void;
  entries?: number;
  onEntriesChange?: (value: number) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  isSettingFilter?: boolean;
}
const TableFilters = ({
  period = "",
  onPeriodChange,
  searchValue = "",
  onSearchChange,
  dateRange = "",
  onDateClick,
  entries,
  onEntriesChange,
  statusFilter = "",
  onStatusFilterChange,
  isSettingFilter = false,
}: TableFiltersProps) => {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap lg:gap-4 gap-2 lg:items-center justify-between">
        <div
          className={`flex flex-wrap lg:gap-4 gap-2 ${entries !== undefined ? "w-[unset]" : "w-full"}`}
        >
          {period && (
            <CommonFilterDropdown
              value={period}
              onChange={(value) => onPeriodChange?.(value)}
              // icon={<Funnel size={18} />}
              options={[
                { label: "All", value: "All" },
                { label: "This Week", value: "this_week" },
                { label: "This Month", value: "this_month" },
                { label: "This Year", value: "this_year" },
              ]}
            />
          )}

          {/* Search */}
          <div className="relative md:w-[200px] w-[130px] xl:w-[330px] bg-white border border-(--border-gray-2) rounded-[4px]">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-text-gray"
            />

            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search"
              className="h-[32px] w-full pl-11 pr-4 outline-none"
            />
          </div>

          {/* Date */}
          {onDateClick && (
            <button
              onClick={onDateClick}
              className="bg-white border border-(--border-gray-2) rounded-[5px] px-2 xl:px-4 py-1 xl:py-2 flex items-center gap-3 cursor-pointer w-fit"
            >
              <Calendar1 size={16} />
              <span className="text-sm font-normal">
                {dateRange || "Select Date Range"}
              </span>
            </button>
          )}

          {isSettingFilter && (
            <div className="sm:ml-auto">
              <CommonFilterDropdown
                value={statusFilter}
                onChange={(value) => onStatusFilterChange?.(value)}
                icon={<SlidersHorizontal size={18} />}
                options={[
                  { label: "Default", value: "" },
                  { label: "Active", value: "active" },
                  { label: "Close", value: "close" },
                  { label: "We Call", value: "we_call" },
                ]}
                size="auto"
              />
            </div>
          )}
        </div>

        {entries !== undefined && (
          <div className="flex items-center gap-3">
            <span>Show</span>

            <select
              value={entries}
              onChange={(e) => onEntriesChange?.(Number(e.target.value))}
              className="h-[38px] px-4 border border-(--border-gray-2) rounded-[8px] outline-none"
            >
              <option value={3}>3</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <span>entries</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableFilters;
