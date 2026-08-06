import { Upload } from "lucide-react";

interface CommonFileUploadProps {
  label: string;
  onChange?: (file: File | null) => void;
}

const CommonFileUpload = ({
  label,
  onChange,
}: CommonFileUploadProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-normal text-black mb-2.5">
        {label}
      </label>

      <label
        className="
          w-full
          h-[40px]
          border-[0.85px]
        rounded-[8px]
        border-[#D1D5DB]
        bg-white
          flex items-center justify-center gap-2
          cursor-pointer
          transition
        "
      >
        <Upload size={18} className="text-[#4B5563]" />

        <span className="text-[14px] font-normal text-[#4B5563]">
          upload
        </span>

        <input
          type="file"
          className="hidden"
          onChange={(e) => onChange?.(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
};

export default CommonFileUpload;