import { useState, useEffect } from "react";
import { Calendar, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { generateStatementsApi, downloadCombinedStatementsXlsx, getContractorByIdApi } from "../../services/auth.service";
import type { GeneratedStatementEntry } from "../../types/auth.types";

const SettlementStatementTab = () => {
  const { id: contractorId } = useParams();
  const [isGenerated, setIsGenerated] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedStatementEntry[] | null>(null);
  const [contractorName, setContractorName] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractor = async () => {
      if (!contractorId) return;
      try {
        const res = await getContractorByIdApi(contractorId);
        setContractorName(res.data?.companyName ?? null);
      } catch (err) {
        // ignore
      }
    };
    fetchContractor();
  }, [contractorId]);

  const handleGenerate = async () => {
    if (!contractorId) {
      setError("Missing contractor");
      return;
    }

    // validate date range
    if (!from || !to) {
      setError("Select date range");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // backend expects YYYY-MM-DD; backend sample used YYYY-MM-DD
      // If user provided dd/mm values, attempt to parse; but do not change UI
      const parseDate = (v: string) => {
        // if already YYYY-MM-DD, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        // try dd/mm/yyyy -> yyyy-mm-dd
        const m = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(v);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        return v;
      };

      const payload: any = {
        contractorId,
        from: parseDate(from),
        to: parseDate(to),
        applyDeductions: true,
      };
      const res = await generateStatementsApi(payload);
      setGenerated(res.data.generated || []);
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate statements");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contractorId) {
      setError("Missing contractor");
      return;
    }

    // validate date range
    if (!from || !to) {
      setError("Select date range");
      return;
    }

    setDownloading(true);
    setError(null);
    try {
      const resp = await downloadCombinedStatementsXlsx(contractorId, from, to);
      const contentType = ((resp as any).headers?.["content-type"] as string) || "application/octet-stream";
      const blob = new Blob([resp.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statements-${from}-to-${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download statements");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Top Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1B2D6B] mb-6">Settlement Statement</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 w-full md:w-auto">
            <h3 className="text-sm font-bold text-[#1B2D6B]">Filter here</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-sm flex items-center gap-1">
                  <Calendar size={16} /> From
                </span>
                <input
                  type="date"
                  defaultValue={from}
                  className="border border-[#EFEEEE] font-archivo rounded-md px-3 py-1.5 text-sm w-[120px] font-medium text-[#1B2D6B] shadow-sm outline-none focus:border-[#1B2D6B]"
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-sm flex items-center gap-1">
                  <Calendar size={16} /> To
                </span>
                <input
                  type="date"
                  defaultValue={to}
                  className="border border-[#EFEEEE] font-archivo rounded-md px-3 py-1.5 text-sm w-[120px] font-medium text-[#1B2D6B] shadow-sm outline-none focus:border-[#1B2D6B]"
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="bg-[#1B2D6B] cursor-pointer hover:bg-[#152456] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap mt-4 md:mt-0"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Generate Statement"}
          </button>
        </div>
      </div>

      {/* Generated Section */}
      {isGenerated && (
        <div className="mt-8 border-t border-[#EFEEEE] font-archivo pt-8">
          <p className="text-sm text-[#374151] mb-4">
            {contractorName ?? "-"}- Settlement Statement- <span className="font-bold">{from} - {to}</span>
          </p>

          <div className="overflow-x-auto border border-[#EFEEEE] font-archivo rounded-t-md mb-6">
            {/* Render generated statements if available */}
            {generated && generated.length > 0 ? (
              <div className="space-y-4">
                {generated.map((g) => (
                  <div key={g.driverId} className="border border-[#EAEAEA] rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{g.driverName ?? "-"}</p>
                        <p className="text-sm text-[#6B7280]">Statement: {g.statement?.statementNo ?? "-"} • Status: {g.statement?.status ?? "-"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Net Pay</p>
                        <p className="text-lg font-bold">${(g.statement?.netPay ?? 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm text-left min-w-[600px]">
                        <thead className="bg-[#F3F4F6]">
                          <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Ticket</th>
                            <th className="px-3 py-2">Pickup</th>
                            <th className="px-3 py-2">Deliver</th>
                            <th className="px-3 py-2">Tonnage</th>
                            <th className="px-3 py-2">Contractor Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(g.statement?.lineItems || []).map((li) => (
                            <tr key={li.ticketId} className="border-t border-[#EFEFEF]">
                              <td className="px-3 py-2">{li.date ? dayjs(li.date).format("DD MMM YYYY") : "-"}</td>
                              <td className="px-3 py-2">{li.ticketNo ?? "-"}</td>
                              <td className="px-3 py-2">{li.pickup ?? "-"}</td>
                              <td className="px-3 py-2">{li.deliver ?? "-"}</td>
                              <td className="px-3 py-2">{li.tonnage != null ? li.tonnage : "-"}</td>
                              <td className="px-3 py-2">{li.contractorAmount != null ? `$${li.contractorAmount.toFixed(2)}` : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B7280] px-5 py-12 flex justify-center items-center">No statements generated for selected range.</p>
            )}
          </div>

          <button disabled={downloading} className="bg-[#1B2D6B] hover:bg-[#1B2D6B]/90 cursor-pointer text-white px-6 py-2.5 rounded flex justify-center items-center gap-2 text-sm font-medium transition-colors lg:min-w-[202px] disabled:opacity-50" onClick={handleDownload}>
            <Download size={16} />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    </div>
  );
};

export default SettlementStatementTab;
