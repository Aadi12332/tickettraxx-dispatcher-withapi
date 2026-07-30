import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, Pencil, Copy, Download } from "lucide-react";
import CommonPagination from "../common/CommonPagination";
import type { DispatchBoardItem } from "../../types/auth.types";

interface DispatchTableProps {
  data: DispatchBoardItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onView?: (item: DispatchBoardItem) => void;
  onEdit?: (item: DispatchBoardItem) => void;
  onCopy?: (item: DispatchBoardItem) => void;
  onDownload?: (item: DispatchBoardItem) => void;
}

const money = (value: number | null | undefined) =>
  `$${(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dash = (value: string | null | undefined) => value || "-";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopy = async (row: DispatchBoardItem) => {
    try {
      const textToCopy = `
      Dispatch ID: ${row.dispatchNo || "-"}
      Dispatch Date: ${row.date}
      Customer: ${dash(row.customer)}
      Job Code: ${dash(row.jobCode)}
      Total Loads: ${row.totalLoads}
      Invoice Total: ${money(row.invoiceTotal)}
      Contractor Total: ${money(row.contractorTotal)}
      Status: ${row.status}
      ${row.comment ? `Comment: ${row.comment}` : ""}
      `.trim();

      await navigator.clipboard.writeText(textToCopy);

      onCopy?.(row);

      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (error) {
      console.error("Failed to copy dispatch:", error);
    }
  };

  const handleDownload = (row: DispatchBoardItem) => {
    onDownload?.(row);

    setDownloadedId(row.id);
    setTimeout(() => setDownloadedId(null), 2200);
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-(--border-gray-2) overflow-hidden">
        <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto border border-(--border-gray-2)">
        <div className="min-w-[1500px]">
          <div className="grid grid-cols-[32px_100px_120px_1fr_130px_200px_110px_100px_120px_140px_100px_130px] gap-2 px-5 py-4 border-b border-(--border-gray-2) text-sm font-semibold text-[#111827]">
            <span />
            <span>Dispatch ID</span>
            <span className="flex items-center gap-1">
              Dispatch Date <ChevronDown size={14} className="text-[#9CA3AF]" />
            </span>
            <span>Customer</span>
            <span>Job ID / PO Code</span>
            <span className="inline-block px-2">Pickup → Delivery</span>
            <span>Material</span>
            <span>Total Loads</span>
            <span>Invoice Total</span>
            <span>Contractor Total</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-(--border-gray-2)">
            {data.map((row) => {
              const isExpanded = expandedId === row.id;
              const dispatchLabel = row.dispatchNo || "-";

              return (
                <div key={row.id}>
                  <div
                    onClick={() => toggleExpand(row.id)}
                    className="grid grid-cols-[32px_100px_120px_1fr_130px_200px_110px_100px_120px_140px_100px_130px] gap-2 px-5 py-4 items-center text-sm cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  >
                    <button className="text-[#9CA3AF] cursor-pointer">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <span className="font-semibold text-[#111827]">{dispatchLabel}</span>
                    <span className="text-[#374151]">
                      {new Date(row.date).toLocaleDateString("en-GB")}
                    </span>
                    <span className="text-[#374151]">{dash(row.customer)}</span>
                    <span className="text-[#374151]">{dash(row.jobCode)}</span>
                    <span className="text-[#374151] flex items-center gap-1 px-2">
                      <span className="line-clamp-2" title={dash(row.pickup)}>{dash(row.pickup)}</span> <span className="text-[#9CA3AF]">→</span>{" "}
                      <span className="line-clamp-2" title={dash(row.delivery)}>{dash(row.delivery)}</span>
                    </span>
                    <span className="text-[#374151]">{dash(row.material)}</span>
                    <span className="text-[#374151]">{row.totalLoads}</span>
                    <span className="text-[#374151]">{money(row.invoiceTotal)}</span>
                    <span className="text-[#374151]">{money(row.contractorTotal)}</span>
                    <span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1D3461] text-white">
                        {row.status}
                      </span>
                    </span>

                    <div
                      className="flex items-center gap-2.5 text-[#374151]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="hover:text-[#233B73] border border-[#233B73] rounded-md p-1 cursor-pointer"
                        onClick={() => onView?.(row)}
                      >
                        <Eye size={14} />
                      </button>

                      {row.status === "Active" && (
                        <button
                          className="hover:text-[#233B73] border border-[#233B73] rounded-md p-1 cursor-pointer"
                          onClick={() => onEdit?.(row)}
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      <button
                        className="hover:text-[#233B73] border border-[#233B73] rounded-md p-1 cursor-pointer"
                        onClick={() => handleCopy(row)}
                      >
                        {copiedId === row.id ? (
                          <span className="text-[11px] font-medium text-green-600 whitespace-nowrap px-1">
                            Copied
                          </span>
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>

                      <button
                        className="hover:text-[#233B73] border border-[#233B73] rounded-md p-1 cursor-pointer"
                        onClick={() => handleDownload(row)}
                      >
                        {downloadedId === row.id ? (
                          <span className="text-[11px] font-medium text-green-600 whitespace-nowrap px-1">
                            Downloaded
                          </span>
                        ) : (
                          <Download size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-[#FAFBFC] border-t border-(--border-gray-2) px-5 py-4 space-y-4">
                      {/* Summary strip */}
                      <div className="bg-white border border-(--border-gray-2) rounded-lg px-4 py-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                        <span>
                          <span className="font-semibold text-[#111827]">Dispatch Id:</span>{" "}
                          <span className="text-[#374151]">{dispatchLabel}</span>
                        </span>
                        <span>
                          <span className="font-semibold text-[#111827]">Dispatch Date:</span>{" "}
                          <span className="text-[#374151]">
                            {new Date(row.date).toLocaleDateString("en-GB")}
                          </span>
                        </span>
                        <span>
                          <span className="font-semibold text-[#111827]">Start Time:</span>{" "}
                          <span className="text-[#374151]">{dash(row.startTime)}</span>
                        </span>
                        <span>
                          <span className="font-semibold text-[#111827]">End Time:</span>{" "}
                          <span className="text-[#374151]">{dash(row.endTime)}</span>
                        </span>
                        {row.comment && (
                          <span>
                            <span className="font-semibold text-[#111827]">Comment:</span>{" "}
                            <span className="text-[#374151]">{row.comment}</span>
                          </span>
                        )}
                      </div>

                      {/* Columns / loads detail */}
                      <div className="bg-white border border-(--border-gray-2) rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-(--border-gray-2)">
                          <h4 className="text-sm font-semibold text-[#111827]">
                            Dispatch Columns / Loads Details
                          </h4>
                        </div>

                        {row.columns.length === 0 ? (
                          <p className="px-4 py-4 text-sm text-[#6B7280]">
                            No loads added yet.
                          </p>
                        ) : (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs font-semibold text-[#111827] border-b border-(--border-gray-2)">
                                <th className="px-4 py-2">Column</th>
                                <th className="px-4 py-2">Job ID / PO Code</th>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Material</th>
                                <th className="px-4 py-2">Pickup</th>
                                <th className="px-4 py-2">Delivery</th>
                                <th className="px-4 py-2">Number of Loads</th>
                                <th className="px-4 py-2">Invoice Rate</th>
                                <th className="px-4 py-2">Contractor Rate</th>
                                <th className="px-4 py-2">Amount (Invoice)</th>
                                <th className="px-4 py-2">Amount (Contractor)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.columns.map((col) => (
                                <tr
                                  key={col.loadId}
                                  className="border-b border-(--border-gray-2) last:border-none text-[#374151]"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    Column {col.column}
                                  </td>
                                  <td className="px-4 py-3">{dash(col.jobCode)}</td>
                                  <td className="px-4 py-3">{dash(col.customer)}</td>
                                  <td className="px-4 py-3">{dash(col.material)}</td>
                                  <td className="px-4 py-3">{dash(col.pickup)}</td>
                                  <td className="px-4 py-3">{dash(col.delivery)}</td>
                                  <td className="px-4 py-3">{col.numberOfLoads}</td>
                                  <td className="px-4 py-3">{money(col.invoiceRate)}</td>
                                  <td className="px-4 py-3">{money(col.contractorRate)}</td>
                                  <td className="px-4 py-3">{money(col.amountInvoice)}</td>
                                  <td className="px-4 py-3">{money(col.amountContractor)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        <div className="flex flex-wrap justify-end gap-x-8 gap-y-1 px-4 py-3 border-t border-(--border-gray-2) text-sm">
                          <span>
                            <span className="font-semibold text-[#111827]">Total Loads:</span>{" "}
                            <span className="text-[#374151]">{row.totalLoads}</span>
                          </span>
                          <span>
                            <span className="font-semibold text-[#111827]">Invoice Total:</span>{" "}
                            <span className="text-[#374151]">{money(row.invoiceTotal)}</span>
                          </span>
                          <span>
                            <span className="font-semibold text-[#111827]">Contractor Total:</span>{" "}
                            <span className="text-[#374151]">{money(row.contractorTotal)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CommonPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default DispatchTable;