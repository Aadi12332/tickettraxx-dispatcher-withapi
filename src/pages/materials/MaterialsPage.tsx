import { useEffect, useState } from "react";
import { PlusCircle, RefreshCcw } from "lucide-react";
import axios from "axios";
import PageHeader from "../../components/common/PageHeader";
import TableFilters from "../../components/common/TableFilters";
import Table from "../../components/common/Table";
import CommonButton from "../../components/common/CommonButton";
import CreateMaterialModal from "../../components/materials/modal/CreateMaterialModal";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import ExportButton from "../../components/common/ExportButton";
import {
  getMaterialsApi,
  deleteMaterialApi,
} from "../../services/auth.service";
import type { Material } from "../../types/auth.types";

const materialColumns = [
  { label: "#", key: "id" },
  { label: "Materials", key: "material" },
  { label: "Details", key: "actions" },
];

type MaterialRow = Material & { id: string; material: string };

const MaterialsPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openEditMaterial, setOpenEditMaterial] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRow | null>(
    null,
  );

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchMaterials = async (pageNum = pagination.page, limit = entries) => {
    setLoading(true);
    setError("");
    try {
      const res = await getMaterialsApi(pageNum, limit);

      setMaterials(res.data);
      setPagination(res.pagination);
    } catch {
      setError("Unable to load materials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(pagination.page, entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, entries]);

  const handleRefresh = () => {
    fetchMaterials(pagination.page, entries);
  };

  const handleCreateSuccess = () => {
    setSuccessTitle("You have successfully created the material.");
    setShowSuccessModal(true);
    fetchMaterials(pagination.page, entries);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleUpdateSuccess = () => {
    setSuccessTitle("You have successfully updated the material.");
    setShowSuccessModal(true);
    fetchMaterials(pagination.page, entries);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleDelete = async (item: MaterialRow) => {
    try {
      await deleteMaterialApi(item._id);
      fetchMaterials(pagination.page, entries);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete material.");
      } else {
        setError("Unable to delete material.");
      }
    }
  };

  const rows = materials.map((material, index) => ({
    ...material,
    id: (pagination.page - 1) * pagination.limit + index + 1,
    material: material.name,
  }));

  const filteredMaterials = rows.filter((item) => {
    if (!search) return true;
    return item.material.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materials"
        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      >
        <div className="flex flex-wrap items-center lg:gap-3 gap-1 ml-auto">
          <CommonButton
            variant="primary"
            size="md"
            icon={<PlusCircle size={18} />}
            onClick={() => setOpenModal(true)}
          >
            Create Materials
          </CommonButton>
          {/* Export */}
          <ExportButton
            onClick={() => {
              console.log("Export started...");
            }}
          />

          {/* Refresh */}
          <CommonButton
            size="md"
            variant="secondary"
            iconOnly
            icon={<RefreshCcw size={18} />}
            onClick={handleRefresh}
          />
        </div>
      </PageHeader>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="p-4 bg-white">
        <TableFilters
          searchValue={search}
          onSearchChange={setSearch}
          entries={entries}
          onEntriesChange={(val) => {
            setEntries(val);

            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));
          }}
        />
        {loading ? (
          <p className="text-sm text-[#979797] py-6 text-center">
            Loading materials...
          </p>
        ) : (
          <Table
            columns={materialColumns}
            data={filteredMaterials}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => {
              fetchMaterials(page, pagination.limit);
            }}
            onEdit={(item) => {
              setSelectedMaterial(item as MaterialRow);
              setOpenEditMaterial(true);
            }}
            onDelete={(item) => handleDelete(item as MaterialRow)}
            minWidth="min-w-[500px]"
          />
        )}
      </div>

      <CreateMaterialModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <CreateMaterialModal
        open={openEditMaterial}
        onClose={() => {
          setOpenEditMaterial(false);
          setSelectedMaterial(null);
        }}
        isEdit
        editData={selectedMaterial}
        onSuccess={handleUpdateSuccess}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
      />
    </div>
  );
};

export default MaterialsPage;
