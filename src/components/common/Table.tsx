import { Checkbox } from "@mui/material";
import { ArrowUpDown, CircleCheck, Eye, X } from "lucide-react";
import delete_orange from "../../assets/icons/delete_orange.svg";
import billImage from "../../assets/images/billimg.png";
import Edit from "../../assets/icons/editfilled.svg";
// import view from "../../assets/icons/EyeClosed.svg";
import { ActionButton } from "../dispatch/DispatchMobileCard";
import CommonPagination from "./CommonPagination";
import StatusToggle from "./StatusToggle";
import { useState } from "react";
import LoadUpdateSuccessModal from "./modal/LoadUpdateSuccessModal";
import CommonConfirmModal from "./modal/CommonConfirmModal";

interface Column {
  label: string;
  key: string;
  render?: (item: any) => React.ReactNode;
  textColor?: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
}

interface TableProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onStatusToggle?: (item: any) => void;
  onRowClick?: (item: any) => void;
  isCheckbox?: boolean;
  minWidth?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

const Table = ({
  data,
  onEdit,
  onDelete,
  columns,
  onStatusToggle,
  minWidth,
  onRowClick,
  isCheckbox = true,
  currentPage = 1,
  totalPages = 1,
  totalItems = data.length,
  pageSize = 10,
  onPageChange = () => {},
  showPagination = true,
}: TableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Bill/invoice view modal state
  const [viewItem, setViewItem] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }

    return 0;
  });

  return (
    <div className="w-full bg-white">
      <div className="overflow-x-auto">
        <table
          className={`w-full border-collapse border-spacing-0 font-archivo ${minWidth || "min-w-[900px]"}`}
        >
          <thead>
            <tr className="bg-[#F9FAFB] border border-[#E8E8E8]">
              {isCheckbox && (
                <th className="w-[45px] py-3 text-center">
                  <Checkbox className="p-0" size="small" />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                  className={`
                     px-2 py-3
  border border-[#E5E7EB]
  text-sm font-medium text-[#1F2937]
                    ${
                      column.key === "actions"
                        ? "text-left px-2"
                        : column.key === "materials"
                          ? "text-left px-2"
                          : "text-left px-1"
                    }
                  `}
                >
                  <div
                    className={`flex items-center gap-2 min-w-0
                      ${
                        column.key === "actions" || column.key === "materials"
                          ? "justify-start"
                          : "justify-start"
                      }
                      ${
                        column.key !== "actions" && column.sortable !== false
                          ? "cursor-pointer"
                          : ""
                      }
                    `}
                    onClick={() =>
                      column.key !== "actions" &&
                      column.sortable !== false &&
                      handleSort(column.key)
                    }
                  >
                    <span className="truncate whitespace-nowrap">
                      {column.label}
                    </span>

                    {column.key !== "actions" && column.sortable !== false && (
                      <ArrowUpDown
                        size={14}
                        color="#707070"
                        className="shrink-0"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

<tbody className="border-x border-[#E8E8E8]">
  {sortedData.length === 0 ? (
    <tr>
      <td
        colSpan={columns.length + (isCheckbox ? 1 : 0)}
        className="py-10 text-center text-sm text-[#707070] border border-[#E5E7EB]"
      >
        No data available
      </td>
    </tr>
  ) : (
    sortedData.map((item) => (
      <tr
        key={item.id}
        onClick={() => onRowClick?.(item)}
        className={`border-b border-[#E5E7EB] bg-white hover:border-gray-300 ${
          onRowClick ? "cursor-pointer" : ""
        }`}
      >
                {isCheckbox && (
                  <td className="w-[45px] py-3 text-center border border-[#E5E7EB]">
                    <Checkbox className="!p-0" size="small" />
                  </td>
                )}

                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                    }}
                    className={`
                        px-2 py-3
                        border border-[#E5E7EB]
                        text-sm
                      ${column.textColor ?? "text-[#707070]"}
                      ${
                        column.key === "actions"
                          ? "text-left"
                          : column.key === "materials"
                            ? "text-left"
                            : "text-left"
                      }
                    `}
                  >
                    {column.key === "status" ? (
                      <StatusToggle
                        active={item.status === "Active"}
                        onToggle={(e) => {
                          e.stopPropagation();
                          onStatusToggle?.(item);
                        }}
                      />
                    ) : column.key === "actions" ? (
                      <div className="flex lg:flex-wrap items-center gap-1.5">
                        <ActionButton
                          icon={<img src={Edit} alt="edit" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(item);
                          }}
                        />

                        <ActionButton
                          icon={<img src={delete_orange} alt="delete" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteItem(item);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    ) : column.key === "ticketAction" ? (
                      <div className="flex flex-wrap items-center justify-start gap-[0.4vw]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewItem(item);
                            setShowViewModal(true);
                          }}
                          className="p-0.5  border border-[#E8E8E8] rounded-sm flex items-center justify-center  hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Eye
                            strokeWidth={2.5}
                            size={19}
                            fill="#707070"
                            color="#fff"
                          />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // onApprove?.(item);
                          }}
                          className="p-1 border border-[#E8E8E8] rounded-sm flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <CircleCheck
                            strokeWidth={2.5}
                            size={14}
                            fill="#707070"
                            color="#fff"
                          />
                        </button>
                      </div>
                    ) : column.render ? (
                      column.render(item)
                    ) : (
                      <div
                        className={
                          column.key === "actions" ? "" : "overflow-hidden"
                        }
                      >
                        {item[column.key]}
                      </div>
                    )}
                  </td>
                ))}
                 </tr>
    ))
  )}
</tbody>
        </table>
      </div>

      {showPagination && totalItems > 0 && (
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
      <CommonConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteItem(null);
        }}
        title="Are you sure you want to delete?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          onDelete?.(deleteItem);
          setShowDeleteModal(false);
          setDeleteItem(null);
          setShowSuccessModal(true);
        }}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Deleted Successfully."
      />

      {/* Bill/Invoice view modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-md w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E8]">
              <h2 className="text-sm font-semibold text-[#1F2937]">
                Bill {viewItem?.ticketNo ? `- ${viewItem.ticketNo}` : ""}
              </h2>

              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewItem(null);
                }}
                className="text-[#707070] hover:text-[#1F2937] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <img
                src={billImage || "https://placehold.co/500x650?text=Bill"}
                alt="Bill"
                className="w-full max-h-[70vh] object-contain rounded-sm border border-[#E8E8E8]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
