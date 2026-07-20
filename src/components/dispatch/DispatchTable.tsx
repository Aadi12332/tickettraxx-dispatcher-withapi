import View from "../../assets/icons/viewfilled.svg";
import Copy from "../../assets/icons/copyfilled.svg";
import Edit from "../../assets/icons/editfilled.svg";
import Download from "../../assets/icons/downloadfilled.svg";
import CommonPagination from "../common/CommonPagination";
import { ActionButton } from "./DispatchMobileCard";
import { useState } from "react";
import type { DispatchItem, DispatchTableProps } from "../../types/auth.types";

const DispatchTable = ({
  data,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onCopy,
  onDownload,
}: DispatchTableProps) => {
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const [downloadedRow, setDownloadedRow] = useState<number | null>(null);

  const handleCopy = async (item: DispatchItem, index: number) => {
    try {
      const textToCopy = `
      Dispatch ID: ${item._id}
      Dispatch Date: ${item.date}
      Grand Total: ${item.total}
      Status: ${item.status}
      ${item.notes ? `Notes: ${item.notes}` : ""}
      `.trim();

      await navigator.clipboard.writeText(textToCopy);

      onCopy?.(item);

      setCopiedRow(index);

      setTimeout(() => {
        setCopiedRow(null);
      }, 2200);
    } catch (error) {
      console.error("Failed to copy dispatch:", error);
    }
  };

  const handleDownload = (item: DispatchItem, index: number) => {
    onDownload?.(item);

    setDownloadedRow(index);

    setTimeout(() => {
      setDownloadedRow(null);
    }, 2200);
  };
  return (
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
          No data available
        </div>
      ) : (
        <>
          <table className="w-full min-w-[700px] table-fixed">
            <thead>
              <tr className="bg-[#E5E7EB]">
                <th className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-left text-xs xl:text-sm font-semibold">
                  Dispatch Date
                </th>

                <th className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-left text-xs xl:text-sm font-semibold">
                  Grand Total
                </th>

                <th className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-left text-xs xl:text-sm font-semibold">
                  Status
                </th>

                <th className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-left text-xs xl:text-sm font-semibold">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-(--border-gray-2)">
                  <td className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-xs xl:text-sm text-[#666666]">
                    {item.date}
                  </td>

                  <td className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2) text-xs xl:text-sm text-[#666666]">
                    {item.total}
                  </td>

                  <td className="w-fit xl:w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2)">
                    <span
                      className={`text-xs xl:text-sm  ${
                        item.status === "Active" ? "text-green" : "text-red-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="w-1/4 md:px-6 px-3 md:py-4 py-3 border border-(--border-gray-2)">
                    <div className="flex justify-left gap-3">
                      <ActionButton
                        icon={<img src={View} alt="" />}
                        onClick={() => onView?.(item)}
                      />

                      {item.status === "Active" && (
                        <ActionButton
                          icon={<img src={Edit} alt="" />}
                          onClick={() => onEdit?.(item)}
                        />
                      )}

                      <ActionButton
                        icon={
                          copiedRow === index ? (
                            <span className="text-[11px] font-medium text-green-600 whitespace-nowrap px-1.5">
                              Copied
                            </span>
                          ) : (
                            <img
                              src={Copy}
                              alt="copy"
                              className="transition-transform duration-500"
                            />
                          )
                        }
                        onClick={() => handleCopy(item, index)}
                      />

                      <ActionButton
                        icon={
                          downloadedRow === index ? (
                            <span className="text-[11px] font-medium text-green-600 whitespace-nowrap px-1.5">
                              Downloaded
                            </span>
                          ) : (
                            <img
                              src={Download}
                              alt="download"
                              className="transition-transform duration-500"
                            />
                          )
                        }
                        onClick={() => handleDownload(item, index)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <CommonPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default DispatchTable;
