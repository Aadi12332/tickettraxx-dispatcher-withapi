import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CommonSelectInputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  addNewLabel?: string;
  addNewMode?: "input" | "modal";
  onAddNew?: (value: string) => void;
}

const CommonSelectInput = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select one...",
  addNewLabel,
  addNewMode = "input",
  onAddNew,
}: CommonSelectInputProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newValue, setNewValue] = useState("");
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const selectedOption = options.find((item) => item.value === value);

const selectedLabel = selectedOption ? selectedOption.label : value || "";

  return (
    <div className="w-full" ref={wrapperRef}>
      <label className="block text-sm font-normal text-black mb-2.5">
        {label}
      </label>

      {isAddingNew ? (
        <input
          autoFocus
          value={newValue}
          placeholder={`Enter ${label}`}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={() => {
            if (newValue.trim()) {
              onAddNew?.(newValue.trim());
            }
            setIsAddingNew(false);
            setNewValue("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (newValue.trim()) {
                onAddNew?.(newValue.trim());
              }
              setIsAddingNew(false);
              setNewValue("");
            }

            if (e.key === "Escape") {
              setIsAddingNew(false);
              setNewValue("");
            }
          }}
          className="w-full h-[40px] border border-[#315497] rounded-[8px] px-4 text-sm outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full h-[40px] border border-[#E5E7EB] rounded-[8px] bg-white px-4 text-sm flex items-center justify-between"
        >
          <span className={value ? "text-black truncate" : "text-[#6B7280]"}>
            {value ? selectedLabel : placeholder}
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {open && (
        <div
          className="
            mt-1
            border
            border-[#E5E7EB]
            rounded-[10px]
            bg-white
            overflow-hidden
          "
        >
          {addNewLabel && (
            <>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);

                  if (addNewMode === "modal") {
                    onAddNew?.(""); 
                  } else {
                    setIsAddingNew(true);
                  }
                }}
                className="
                  sticky
                  top-0
                  z-10
                  bg-white
                  w-full
                  text-left
                  px-3
                  py-3
                  text-[13px]
                  font-semibold
                  border-b
                  border-[#E5E7EB]
                "
              >
                {addNewLabel}
              </button>
            </>
          )}

          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                className={`
                  w-full
                  text-left
                  px-3
                  py-2.5
                  text-sm
                  hover:bg-gray-50
                  transition-colors
                  ${value === option.value ? "bg-gray-100 font-medium" : ""}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonSelectInput;
