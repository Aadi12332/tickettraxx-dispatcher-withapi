import { useNavigate, useLocation } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import placeholderIcon from "../../assets/icons/placeholderImg.svg";
import CommonFileUpload from "../../components/common/CommonFileUpload";
import CommonButton from "../../components/common/CommonButton";
import ToastModal from "../../components/common/modal/ToastModal";
import { useEffect, useState } from "react";
import LightSelect from "./LightSelect";
import { createDriverApi } from "../../services/auth.service";

const LightInput = ({ label, type = "text", ...props }: any) => (
  <div className="relative w-full h-[65px] border border-[#E5E7EB] rounded-[5px] bg-white px-4 pt-2 ">
    <label className="block text-xs font-medium text-[#6B7280]">{label}</label>
    <input
      type={type}
      className="w-full bg-transparent text-sm text-[#1B2D6B] font-medium outline-none mt-1"
      {...props}
    />
  </div>
);

export const stateOptions = [
  { label: "New York", value: "New York" },
  { label: "California", value: "California" },
  { label: "Texas", value: "Texas" },
  { label: "Florida", value: "Florida" },
  { label: "Illinois", value: "Illinois" },
  { label: "Ohio", value: "Ohio" },
  { label: "Michigan", value: "Michigan" },
  { label: "Oregon", value: "Oregon" },
  { label: "New Jersey", value: "New Jersey" },
  { label: "Colorado", value: "Colorado" },
  { label: "Wisconsin", value: "Wisconsin" },
  { label: "Arkansas", value: "Arkansas" },
  { label: "Kentucky", value: "Kentucky" },
  { label: "Nevada", value: "Nevada" },
  { label: "Virginia", value: "Virginia" },
  { label: "South Carolina", value: "South Carolina" },
  { label: "Maryland", value: "Maryland" },
  { label: "Arizona", value: "Arizona" },
  { label: "Pennsylvania", value: "Pennsylvania" },
  { label: "Washington", value: "Washington" },
];

export const cityOptions = [
  { label: "Brooklyn Heights", value: "Brooklyn Heights" },
  { label: "Astoria", value: "Astoria" },
  { label: "Greenwich Village", value: "Greenwich Village" },
  { label: "Upper West Side", value: "Upper West Side" },
  { label: "Harlem", value: "Harlem" },
  { label: "SoHo", value: "SoHo" },
  { label: "Battery Park City", value: "Battery Park City" },
  { label: "East Village", value: "East Village" },
  { label: "Chelsea", value: "Chelsea" },
  { label: "Williamsburg", value: "Williamsburg" },
  { label: "Morningside Heights", value: "Morningside Heights" },
  { label: "DUMBO", value: "DUMBO" },
  { label: "Little Italy", value: "Little Italy" },
  { label: "Flatiron District", value: "Flatiron District" },
  { label: "NoMad", value: "NoMad" },
  { label: "Hell's Kitchen", value: "Hell's Kitchen" },
  { label: "Long Island City", value: "Long Island City" },
  { label: "Tribeca", value: "Tribeca" },
  { label: "Midtown", value: "Midtown" },
  { label: "Financial District", value: "Financial District" },
];

export const parkingLocationOptions = [
  { label: "Granite Ridge", value: "Granite Ridge" },
  { label: "Marble Falls", value: "Marble Falls" },
  { label: "Slate Harbor", value: "Slate Harbor" },
  { label: "Quartz Springs", value: "Quartz Springs" },
  { label: "Shale Valley", value: "Shale Valley" },
  { label: "Gravel Ridge", value: "Gravel Ridge" },
  { label: "Stone Harbor", value: "Stone Harbor" },
  { label: "Cobblestone Creek", value: "Cobblestone Creek" },
  { label: "Gemstone Ridge", value: "Gemstone Ridge" },
  { label: "Rockfield Springs", value: "Rockfield Springs" },
  { label: "Sandstone Valley", value: "Sandstone Valley" },
  { label: "Flintwood Springs", value: "Flintwood Springs" },
  { label: "Basalt Valley", value: "Basalt Valley" },
  { label: "Riverstone Bay", value: "Riverstone Bay" },
  { label: "Rocktop Springs", value: "Rocktop Springs" },
  { label: "Stonewood Heights", value: "Stonewood Heights" },
  { label: "Eaststone Valley", value: "Eaststone Valley" },
  { label: "Canyon Point", value: "Canyon Point" },
  { label: "Blue Rock Yard", value: "Blue Rock Yard" },
  { label: "Ironwood Depot", value: "Ironwood Depot" },
];

const DocumentUpload = ({
  title,
  previewUrl,
  onFileSelect,
}: {
  title: string;
  previewUrl: string | null;
  onFileSelect: (file: File | null) => void;
}) => (
  <div className="mb-8">
    <div className="flex flex-col md:flex-row gap-6 justify-between">
      <div className="flex-2 flex flex-col">
        <h3 className="text-[#1B2D6B] text-base font-semibold mb-3">{title}</h3>
        <div className="flex-1 border-2 border-dashed border-[#d1d5db] rounded-lg bg-[#F2F2F7] flex flex-col items-center justify-center min-h-[220px]">
          <div className="border-10 border-white w-full h-full flex justify-center items-center flex-col rounded-lg">
            <img src={placeholderIcon} alt="" className="" />
            <p className="text-[#6B7280] text-sm  font-medium">
              Drag the picture
            </p>
            <p className="text-[#9CA3AF] text-sm  ">or</p>
            <div className="flex items-center gap-2 transition-colors mb-2">
             <CommonFileUpload
  label="Upload Image"
  onChange={onFileSelect}
/>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <h4 className="text-[#1B2D6B] text-base font-semibold mb-3">
          Preview {title.replace(" Picture", "")}
        </h4>
        <div className="border border-[#E8E8E8] rounded-lg overflow-hidden h-[259px] w-[272px] bg-white flex items-center justify-center relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <img
              src={placeholderIcon}
              alt="No file selected"
              className="w-16 h-16 opacity-40 object-contain"
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

const AddDriverPage = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const contractorId = (location.state as { contractorId?: string } | null)
    ?.contractorId;

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [parking, setParking] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cdlFile, setCdlFile] = useState<File | null>(null);
  const [medicalCardFile, setMedicalCardFile] = useState<File | null>(null);
  const [cdlPreviewUrl, setCdlPreviewUrl] = useState<string | null>(null);
const [medicalCardPreviewUrl, setMedicalCardPreviewUrl] = useState<string | null>(null);

  const handleCdlSelect = (file: File | null) => {
    setCdlFile(file);
    setCdlPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleMedicalCardSelect = (file: File | null) => {
    setMedicalCardFile(file);
    setMedicalCardPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  useEffect(() => {
    return () => {
      if (cdlPreviewUrl) URL.revokeObjectURL(cdlPreviewUrl);
      if (medicalCardPreviewUrl) URL.revokeObjectURL(medicalCardPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const handleSubmit = async () => {
  if (!name.trim()) {
    setError("Name is required.");
    return;
  }

  if (!contractorId) {
    setError("Missing contractor reference — please go back and try again.");
    return;
  }

  setError("");
  setSubmitting(true);
  try {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("contractorId", contractorId);
    if (state) fd.append("state", state);
    if (city) fd.append("city", city);
    if (address) fd.append("address", address);
    if (parking) fd.append("parkingLocation", parking);
    if (phone) fd.append("phone", phone);
    if (email) fd.append("email", email);
    if (medicalCardFile) fd.append("medicalCard", medicalCardFile);
    if (cdlFile) fd.append("cdl", cdlFile);

    await createDriverApi(fd);

    setOpen(true);
    setTimeout(() => {
      setOpen(false);
      navigate(-1);
    }, 2000);
  } catch (err) {
    console.error("Failed to add driver:", err);
    setError("Failed to add driver. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="pb-10">
      <div className="flex items-start gap-4 mb-8 flex-wrap">
        <CommonButton
          onClick={() => navigate(-1)}
          size="sm"
          icon={<MoveLeft size={18} />}
        >
          Back
        </CommonButton>
        <div>
          <h1 className="text-xl font-bold text-[#1B2D6B] leading-tight">
            Add Driver
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <LightInput
          label="Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />

        <LightSelect label="State" value={state} options={stateOptions} onChange={setState} />
        <LightSelect label="City" value={city} options={cityOptions} onChange={setCity} />
        <LightSelect
          label="Parking Location"
          value={parking}
          options={parkingLocationOptions}
          onChange={setParking}
        />

        <LightInput
          label="Address"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
        />
        <LightInput
          label="Email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <LightInput
          label="Phone"
          type="tel"
          value={phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
        />
      </div>

      <DocumentUpload
        title="CDL Picture"
        previewUrl={cdlPreviewUrl}
        onFileSelect={handleCdlSelect}
      />

      <DocumentUpload
        title="Medical Card Picture"
        previewUrl={medicalCardPreviewUrl}
        onFileSelect={handleMedicalCardSelect}
      />

      <div className="flex justify-end mt-10">
        <CommonButton
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Driver"}
        </CommonButton>
      </div>
      <ToastModal
        open={open}
        onClose={() => setOpen(false)}
        type="success"
        title="A New Driver Has Been Added"
      />
    </div>
  );
};

export default AddDriverPage;