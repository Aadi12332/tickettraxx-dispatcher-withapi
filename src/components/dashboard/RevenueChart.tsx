import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import SectionTitle from "../common/SectionTitle";
import { useState, useMemo } from "react";
import ToggleButtonGroup from "../common/ToggleButtonGroup";
import type { RevenueSummary } from "../../types/auth.types";

interface RevenueChartProps {
  revenueSummary: RevenueSummary | null;
  loading?: boolean;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-01" -> "Jan"
const formatMonthLabel = (month: string) => {
  const [, m] = month.split("-");
  const idx = Number(m) - 1;
  return monthNames[idx] ?? month;
};

export default function RevenueChart({ revenueSummary, loading = false }: RevenueChartProps) {
  const [period, setPeriod] = useState("ytd");

  const monthlySeries = revenueSummary?.monthlySeries ?? [];

  // API ke monthlySeries me jo bhi years mile hain unhi se dropdown banate hain
  // (koi hardcoded/fake year list nahi — jitna data hai utna hi dikhta hai)
  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(monthlySeries.map((item) => item.month.split("-")[0]))
    ).sort((a, b) => Number(b) - Number(a));
    return uniqueYears;
  }, [monthlySeries]);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const activeYear = selectedYear || years[0] || "";

  const yearFiltered = monthlySeries.filter((item) => item.month.startsWith(activeYear));

  // Note: backend abhi sirf ek "period" (ytd) return karti hai — jab "Last 12 months" ke liye
  // alag data API se aane lage to yahan sirf ek line change karni hogi (period ke hisaab se
  // alag series select kar lena). Tab tak dono toggle same saal ka data dikhate hain.
  const chartData = yearFiltered.map((item) => ({
    month: formatMonthLabel(item.month),
    revenue: item.revenue,
  }));

  const total = revenueSummary?.total ?? 0;
  const yoy = revenueSummary?.yoyPercent;

  return (
    <div className="bg-white rounded-[5px] border border-(--border-gray-2) shadow-sm">
      <div className="flex items-center flex-wrap justify-between border-b border-(--border-gray-2) px-5 py-2 sm:py-3 gap-3">
        <SectionTitle title="Dispatch Dashboard Quick View" />
        <div className="flex items-center gap-2 sm:ml-auto">
          <ToggleButtonGroup
            value={period}
            onChange={setPeriod}
            options={[
              {
                label: "Year to date",
                value: "ytd",
              },
              {
                label: "Last 12 months",
                value: "12months",
              },
            ]}
          />

          <select
            value={activeYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded px-3 py-1.5 outline-none border border-(--border-gray-2) text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 px-4">
        <h2 className="text-base font-bold font-archivo">
          ${total.toLocaleString()}
        </h2>

        <p className="font-medium text-xs font-archivo">
          {yoy !== null && yoy !== undefined ? (
            <>
              <span className={`font-medium text-xs ${yoy >= 0 ? "text-green" : "text-red-500"}`}>
                {yoy >= 0 ? "+" : ""}{yoy}%
              </span>
              <span className="text-(--color-gray-text)! font-normal ml-1">
                increased from last year
              </span>
            </>
          ) : (
            <span className="text-(--color-gray-text)! font-normal">
              No year-over-year data yet
            </span>
          )}
        </p>
      </div>

      <div className="flex justify-end mt-2 px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[linear-gradient(90deg,#FF6F28_0%,#FF5325_100%)] text-xs " />
          Revenue
        </div>
      </div>

      <div className="h-[280px] mt-4">
        {loading ? (
          <div className="h-full w-full animate-pulse bg-gray-50" />
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#395FA6" />
                  <stop offset="100%" stopColor="#122F68" />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" style={{fontSize:'12px'}} />

              <YAxis
                tickFormatter={(value) => `${value / 1000}K`}
                axisLine={false}
                tickLine={false}
                style={{fontSize:'12px'}}
              />

              <Tooltip />

              <Bar
                dataKey="revenue"
                fill="url(#revenueGradient)"
                radius={[6, 6, 0, 0]}
                barSize={21}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}