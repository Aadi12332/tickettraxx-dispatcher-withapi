import { useNavigate, useLocation } from "react-router-dom";
import { MoveLeft, Plus, Minus } from "lucide-react";
import placeholderIcon from "../../assets/icons/placeholderImg.svg";
import CommonFileUpload from "../../components/common/CommonFileUpload";
import CommonButton from "../../components/common/CommonButton";
import ToastModal from "../../components/common/modal/ToastModal";
import { useEffect, useState } from "react";
import { createTruckApi } from "../../services/auth.service";

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

const QuantityInput = ({ label, value, onIncrease, onDecrease }: any) => (
  <div className="relative w-full h-[65px] border border-[#E5E7EB] rounded-[5px] bg-white px-4 pt-2 flex flex-col justify-center">
    <label className="block text-xs font-medium text-[#6B7280] absolute top-2">{label}</label>
    <div className="flex items-center justify-between mt-3">
      <button className="text-[#1B2D6B] outline-none cursor-pointer" onClick={onDecrease}>
        <Minus size={18} />
      </button>
      <span className="text-sm text-[#1B2D6B] font-medium">{value}</span>
      <button className="text-[#1B2D6B] outline-none cursor-pointer" onClick={onIncrease}>
        <Plus size={18} />
      </button>
    </div>
  </div>
);

const DocumentUpload = ({
  title,
  previewImg,
  onFileSelect,
}: {
  title: string;
  previewImg: string;
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
          {previewImg ? (
            <img
              src={previewImg}
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

const AddTruckPage = () => {
  const [open, setOpen] = useState(false);
  const [aliasValue, setAliasValue] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const contractorId = (location.state as { contractorId?: string } | null)
    ?.contractorId;

  const [form, setForm] = useState({
    unitNumber: "",
    alias1: "",
    truckName: "",
    year: "",
    vinNumber: "",
    assignedDriverId: "",
  });
  const [dotInspectionFile, setDotInspectionFile] = useState<File | null>(null);
  const [dotInspectionPreview, setDotInspectionPreview] = useState<string | null>(null);

  const handleField = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleDotInspectionSelect = (file: File | null) => {
  setDotInspectionFile(file);

  setDotInspectionPreview((prev) => {
    if (prev) URL.revokeObjectURL(prev);
    return file ? URL.createObjectURL(file) : null;
  });
};

useEffect(() => {
  return () => {
    if (dotInspectionPreview) {
      URL.revokeObjectURL(dotInspectionPreview);
    }
  };
}, [dotInspectionPreview]);

  const handleSubmit = async () => {
    if (!contractorId) {
      setError("Missing contractor reference — please go back and try again.");
      return;
    }
    if (!form.unitNumber.trim()) {
      setError("Unit Number is required.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("unitNumber", form.unitNumber);
      fd.append("contractorId", contractorId);
      if (form.assignedDriverId) fd.append("assignedDriverId", form.assignedDriverId);

      const aliasParts = [String(aliasValue), form.alias1].filter(Boolean);
      if (aliasParts.length) fd.append("alias", aliasParts.join(","));

      if (form.truckName) fd.append("truckName", form.truckName);
      if (form.year) fd.append("year", form.year);
      if (form.vinNumber) fd.append("vinNumber", form.vinNumber);
      if (dotInspectionFile) fd.append("dotInspection", dotInspectionFile);

      await createTruckApi(fd);

      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Failed to add truck:", err);
      setError("Failed to add truck. Please try again.");
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
            Add Truck
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
          label="Unit Number"
          value={form.unitNumber}
          onChange={handleField("unitNumber")}
        />
        <QuantityInput
          label="Alias"
          value={aliasValue}
          onIncrease={() => setAliasValue((prev) => prev + 1)}
          onDecrease={() => setAliasValue((prev) => (prev > 0 ? prev - 1 : 0))}
        />
        <LightInput
          label="Alias 1"
          value={form.alias1}
          onChange={handleField("alias1")}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-[#1B2D6B] text-lg font-bold mb-3">Truck details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LightInput
            label="Model & Brand"
            value={form.truckName}
            onChange={handleField("truckName")}
          />
          <LightInput
            label="Year"
            value={form.year}
            onChange={handleField("year")}
          />
          <LightInput
            label="Truck VIN Number"
            value={form.vinNumber}
            onChange={handleField("vinNumber")}
          />
        </div>
      </div>

    <DocumentUpload
  title="Truck DOT Inspection Picture"
  previewImg={dotInspectionPreview || placeholderIcon}
  onFileSelect={handleDotInspectionSelect}
/>

      <div className="flex justify-end mt-10">
        <CommonButton
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Truck"}
        </CommonButton>
      </div>
      <ToastModal
        open={open}
        onClose={() => setOpen(false)}
        type="success"
        title="A New Truck Has Been Added"
      />
    </div>
  );
};

export default AddTruckPage;