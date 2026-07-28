import { forwardRef } from "react";
import { TextField } from "@mui/material";

interface CommonTextInputProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  isAmount?: boolean;
  isPercentage?: boolean;
  min?: string;
  max?: string;
  error?: boolean;
}

const CommonTextInput = forwardRef<HTMLInputElement, CommonTextInputProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder,
      type = "text",
      isAmount = false,
      isPercentage = false,
      min,
      max,
      error = false,
    },
    ref,
  ) => {
    const handleChange = (input: string) => {
      if (!isAmount && !isPercentage) {
        onChange?.(input);
        return;
      }

      // Allow only digits and one decimal point
      let numeric = input.replace(/[^\d.]/g, "");

      const parts = numeric.split(".");
      if (parts.length > 2) {
        numeric = `${parts[0]}.${parts.slice(1).join("")}`;
      }

      if (!numeric) {
        onChange?.("");
        return;
      }

      if (isAmount) {
        onChange?.(`$${numeric}`);
      } else if (isPercentage) {
        onChange?.(`${numeric}%`);
      }
    };

    return (
      <div className="w-full">
        <label className="block text-sm xl:text-base font-normal text-black mb-2.5">
          {label}
        </label>

        <TextField
          inputRef={ref}
          fullWidth
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          className="cursor-pointer"
          slotProps={{
            htmlInput: {
              min,
              max,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#fff",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#EF4444" : "#E5E7EB",
              borderWidth: "0.85px",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#EF4444" : "#E5E7EB",
              borderWidth: "0.85px",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: error ? "#EF4444" : "#E5E7EB",
                borderWidth: "1px",
              },
          }}
        />
      </div>
    );
  },
);

export default CommonTextInput;
