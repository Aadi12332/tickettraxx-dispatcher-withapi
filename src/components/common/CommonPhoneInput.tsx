import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { defaultCountries, parseCountry } from "react-international-phone";

const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

const countryCodes = Array.from(
  new Map(
    defaultCountries.map((country) => {
      const parsed = parseCountry(country);

      return [
        `+${parsed.dialCode}`,
        {
          label: `${getFlagEmoji(parsed.iso2)} +${parsed.dialCode}`,
          value: `+${parsed.dialCode}`,
        },
      ];
    }),
  ).values(),
);

interface CommonPhoneInputProps {
  label: string;
  countryCode?: string;
  phone?: string;
  onCountryChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  placeholder?: string;
}

const CommonPhoneInput = ({
  label,
  countryCode = "+1",
  phone = "",
  onCountryChange,
  onPhoneChange,
  placeholder = "Enter phone number",
}: CommonPhoneInputProps) => {
  const handlePhoneChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    onPhoneChange?.(numeric);
  };
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountryCodes = countryCodes.filter((country) =>
    country.label.toLowerCase().includes(countrySearch.toLowerCase()),
  );

const nationalNumber =
  phone && countryCode && phone.startsWith(countryCode)
    ? phone.slice(countryCode.length)
    : phone.replace(/^\+\d+/, "");

  return (
    <div className="w-full">
      <label className="block text-sm font-normal text-black mb-2.5">
        {label}
      </label>

      <div className="flex gap-1">
        <FormControl sx={{ width: 130 }}>
          <Select
            value={countryCode}
            onChange={(e) => onCountryChange?.(e.target.value)}
            onOpen={() => setCountrySearch("")}
            onClose={() => setCountrySearch("")}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    maxHeight: 300,
                  },
                },
              },
            }}
            IconComponent={(props) => (
              <ChevronDown {...props} size={14} className={props.className} />
            )}
            sx={{
              height: 40,
              width: 80,
              borderRadius: "8px",
              fontSize: 12,
              paddingX: 0,
              outline: 0,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E5E7EB",
                borderWidth: "0.85px",
                padding: "0px",
              },
              "& .MuiSelect-select.MuiSelect-outlined": {
                padding: "0px 10px",
              },
                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
  borderColor: "#E5E7EB",
  borderWidth: "0.85px",
},
            }}
          >
            <div
              className="sticky top-0 z-10 bg-white px-2 py-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                    width: "100%",
                    maxWidth: "80px",
                    borderRadius: "6px",
                    fontSize: 13,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
  borderColor: "#E5E7EB",
  borderWidth: "0.85px",
},
                }}
              />
            </div>

            {filteredCountryCodes.length > 0 ? (
              filteredCountryCodes.map((country) => (
                <MenuItem key={country.value} value={country.value}>
                  {country.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Not found</MenuItem>
            )}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          value={nationalNumber}
          placeholder={placeholder}
          onChange={(e) => handlePhoneChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 40,
              borderRadius: "8px",
              fontSize: 14,
              background: "#fff",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E5E7EB",
              borderWidth: "0.85px",
            },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E5E7EB",
              borderWidth: "0.85px",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
  borderColor: "#E5E7EB",
  borderWidth: "0.85px",
},
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#E5E7EB",
                borderWidth: "0.85px",
              },
          }}
        />
      </div>
    </div>
  );
};

export default CommonPhoneInput;
