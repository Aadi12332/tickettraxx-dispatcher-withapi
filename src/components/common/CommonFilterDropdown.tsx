import { MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface CommonFilterDropdownProps {
  title?: string;
  value: string;
  options: Option[];
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  size?: string;
}

const CommonFilterDropdown = ({
  title,
  value,
  options,
  icon,
  onChange,
  size = "130px",
}: CommonFilterDropdownProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <div className="w-fit">
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <div className="flex items-center gap-2 text-[#111827]">
                {icon}
                <p className="min-h-[20.3px] text-[14px]">{title}</p>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1 text-[#111827] text-sm">
              {icon}
              <span className="line-clamp-1">
                {options.find((item) => item.value === selected)?.label}
              </span>
            </div>
          );
        }}
        className="focus:outline-none"
        IconComponent={(props) => (
          <ChevronDown
            {...props}
            size={14}
            className={`${props.className} transition-transform duration-200`}
          />
        )}
        sx={{
          minWidth: size,
          maxWidth: size,
          height: "36px",
          borderRadius: "5px",
          backgroundColor: "#fff",
          fontWeight: 500,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E7EB",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E7EB",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E5E7EB",
          },
          "& .MuiSelect-iconOpen": {
            transform: "translateY(-50%) rotate(180deg)",
          },
          "& .MuiSelect-icon": {
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6B7280",
            // width: "12px",
            // height: "12px",
          },
          "& .MuiSelect-icon svg": {
            width: "10px",
            height: "10px",
            strokeWidth: "1.5",
          },
        }}
              MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            disablePortal: true,
            slotProps: {
              paper: {
                sx: {
                  mt: 0.5,
                  maxHeight: 300,
                  borderRadius: "10px",
                  overflowY: "auto",
                  boxShadow: "none",
                  border: "1px solid #E8E8E8",
                },
              },
            },
          }}
      >
        <MenuItem disabled value="" sx={{fontSize:"14px"}}>
          Select
        </MenuItem>

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{fontSize:"14px"}}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default CommonFilterDropdown;
