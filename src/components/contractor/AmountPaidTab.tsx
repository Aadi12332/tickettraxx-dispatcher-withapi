import { Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import Table from "../common/Table";
import { getContractorAmountPaidApi } from "../../services/auth.service";
import type { AmountPaidItem } from "../../types/auth.types";

export const amountPaidColumns = [
  {
    label: "Job ID",
    key: "jobId",
    textColor: "#1D3461",
  },
  {
    label: "Date",
    key: "date",
  },
  {
    label: "Driver",
    key: "driver",
  },
  {
    label: "Amount Paid",
    key: "amountPaid",
  },
];

const formatCurrency = (n: number) => {
  return `$${n?.toFixed(2) ?? "0.00"}`;
};

const AmountPaidTab = ({ contractorId }: { contractorId?: string }) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<AmountPaidItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!contractorId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getContractorAmountPaidApi(contractorId);
        setData(res.data || []);
        setTotal(res.totalAmountPaid || 0);
      } catch (err) {
        console.error(err);
        setError("Unable to load amount paid");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [contractorId]);

  const mapped = data.map((it) => ({
    id: it._id,
    jobId: it.jobCode ?? it.jobId ?? it.ticketNo ?? "-",
    date: it.date ? dayjs(it.date).format("DD MMM YYYY") : "-",
    driver: it.driverName ?? "-",
    amountPaid: formatCurrency(it.amountPaid ?? 0),
  }));

  const filteredData = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return mapped;

    return mapped.filter((item) =>
      Object.values(item).some((field) =>
        String(field).toLowerCase().includes(value),
      ),
    );
  }, [search, mapped]);

  return (
    <div className="border border-[#E5E7EB]">
      <div className="flex items-center justify-between gap-3 p-2 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-[#1B2D6B]">
          Amount Paid
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-t border-[#E5E7EB] pt-5 px-2 sm:px-4">
        <p className="text-sm sm:text-base font-medium text-[#1B2D6B]">
          Total Amount Paid : {formatCurrency(total)}
        </p>
        <div className="relative w-full sm:w-auto">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 pl-9 pr-4 h-9 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#233B73] bg-white"
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <Table
            data={filteredData}
            columns={amountPaidColumns}
            isCheckbox={false}
            minWidth="min-w-[800px]"
          />
        )}
      </div>
    </div>
  );
};

export default AmountPaidTab;
