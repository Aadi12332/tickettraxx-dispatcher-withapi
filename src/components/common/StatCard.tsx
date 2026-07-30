import React from "react";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}

const StatsCard = ({ icon, title, value }: StatsCardProps) => {
  return (
<div className="w-full min-w-0 bg-white border border-[#E5E7EB] rounded-[5px] xl:px-5 px-3 py-2 flex items-center gap-2">
      {/* Icon */}
      <div className="sm:w-[40px] w-8 sm:h-[40px] h-8 border border-[#1D3461] bg-[#B9D1FF73] sm:rounded-[14px] rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <p className="text-[11px] font-medium text-[#6B7280] xl:leading-[20px]">
          {title}
        </p>
        <h3 className="text-sm sm:text-base xl:text-lg font-semibold text-[#111827] xl:leading-[40px]">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatsCard;