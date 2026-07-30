import { useState } from "react";
import { Calendar, Download } from "lucide-react";

const tableData = [
  {
    date: "16/02/2026",
    pickup: "Hanson Lake",
    deliver: "LMC- Coppell",
    ticketNo: "1234534",
    quantity: "27.50",
    rate: "$11.50",
    amount: "$302.50",
    surcharge: "$302.50",
  },
  {
    date: "16/02/2026",
    pickup: "Hanson Lake",
    deliver: "LMC- Coppell",
    ticketNo: "1234534",
    quantity: "27.50",
    rate: "$11.50",
    amount: "$302.50",
    surcharge: "$302.50",
  },
  {
    date: "16/02/2026",
    pickup: "Hanson Lake",
    deliver: "LMC- Coppell",
    ticketNo: "1234534",
    quantity: "27.50",
    rate: "$11.50",
    amount: "$302.50",
    surcharge: "$302.50",
  },
  {
    date: "16/02/2026",
    pickup: "Hanson Lake",
    deliver: "LMC- Coppell",
    ticketNo: "1234534",
    quantity: "27.50",
    rate: "$11.50",
    amount: "$302.50",
    surcharge: "$302.50",
  },
];

const SettlementStatementTab = () => {
  const [isGenerated, setIsGenerated] = useState(false);

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
                  defaultValue="01/12/2024"
                  className="border border-[#EFEEEE] font-archivo rounded-md px-3 py-1.5 text-sm w-[120px] font-medium text-[#1B2D6B] shadow-sm outline-none focus:border-[#1B2D6B]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#6B7280] text-sm flex items-center gap-1">
                  <Calendar size={16} /> To
                </span>
                <input
                  type="date"
                  defaultValue="30/12/2024"
                  className="border border-[#EFEEEE] font-archivo rounded-md px-3 py-1.5 text-sm w-[120px] font-medium text-[#1B2D6B] shadow-sm outline-none focus:border-[#1B2D6B]"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsGenerated(true)}
            className="bg-[#1B2D6B] cursor-pointer hover:bg-[#152456] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap mt-4 md:mt-0"
          >
            Generate Statement
          </button>
        </div>
      </div>

      {/* Generated Section */}
      {isGenerated && (
        <div className="mt-8 border-t border-[#EFEEEE] font-archivo pt-8">
          <p className="text-sm text-[#374151] mb-4">
            Hudson Freight LLC- Settlement Statement- <span className="font-bold">01/12/2024-30/12/2024</span>
          </p>

          <div className="overflow-x-auto border border-[#EFEEEE] font-archivo rounded-t-md mb-6">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-[#1B2D6B] text-white font-medium">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Pickup</th>
                  <th className="px-4 py-3 font-semibold">Deliver</th>
                  <th className="px-4 py-3 font-semibold">Ticket No.</th>
                  <th className="px-4 py-3 font-semibold">Quantity</th>
                  <th className="px-4 py-3 font-semibold">Rate</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Surcharge</th>
                </tr>
              </thead>
              <tbody className="text-[#374151]">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#EFEEEE] font-archivo">
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3">{row.pickup}</td>
                    <td className="px-4 py-3">{row.deliver}</td>
                    <td className="px-4 py-3">{row.ticketNo}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">{row.rate}</td>
                    <td className="px-4 py-3">{row.amount}</td>
                    <td className="px-4 py-3">{row.surcharge}</td>
                  </tr>
                ))}
                
                {/* Vehicle Subtotals */}
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={5} className="bg-white"></td>
                  <td colSpan={2} className="px-4 py-3 font-semibold border-l border-[#EFEEEE] font-archivo">Subtotal</td>
                  <td className="px-4 py-3 font-semibold font-archivo border-l border-[#EFEEEE]">$2,218.00</td>
                </tr>
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={5} className="bg-white"></td>
                  <td colSpan={2} className="px-4 py-3 font-semibold border-l border-[#EFEEEE] font-archivo">Fuel Surcharge</td>
                  <td className="px-4 py-3 font-semibold font-archivo border-l border-[#EFEEEE]">$512.00</td>
                </tr>
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={5} className="bg-white"></td>
                  <td colSpan={2} className="px-4 py-3 font-semibold border-l border-[#EFEEEE] font-archivo">Vehicle Total</td>
                  <td className="px-4 py-3 font-semibold font-archivo border-l border-[#EFEEEE]">$1750.00</td>
                </tr>

                {/* Final Totals */}
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={2} className="px-4 py-4 font-bold border-r border-[#EFEEEE] font-archivo">Contractor Total</td>
                  <td colSpan={6} className="px-4 py-4 font-bold">$2,540.00</td>
                </tr>
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={2} className="px-4 py-4 font-bold border-r border-[#EFEEEE] font-archivo">Total Fuel surcharge</td>
                  <td colSpan={6} className="px-4 py-4 font-bold">$27.30</td>
                </tr>
                <tr className="border-b border-[#EFEEEE] font-archivo">
                  <td colSpan={2} className="px-4 py-4 font-bold border-r border-[#EFEEEE] font-archivo">Total Fuel deductions</td>
                  <td colSpan={6} className="px-4 py-4 font-bold">$0.00</td>
                </tr>
                <tr>
                  <td colSpan={2} className="px-4 py-4 font-bold border-r border-[#EFEEEE] font-archivo">Total Payment</td>
                  <td colSpan={6} className="px-4 py-4 font-bold">$2,567.82</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button className="bg-[#1B2D6B] hover:bg-[#1B2D6B]/90 cursor-pointer text-white px-6 py-2.5 rounded flex justify-center items-center gap-2 text-sm font-medium transition-colors lg:min-w-[202px]">
            <Download size={16} />
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default SettlementStatementTab;
