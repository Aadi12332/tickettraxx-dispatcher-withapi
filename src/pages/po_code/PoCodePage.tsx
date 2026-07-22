import { useEffect, useState, useCallback } from "react";
import { Search, PlusCircle, RefreshCcw } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import CreatePOCodeModal from "../../components/po_code/modal/CreatePoModal";
import Table from "../../components/common/Table";
import CommonButton from "../../components/common/CommonButton";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import CreatePickupModal from "../../components/pickup/modal/CreatePickupModal";
import ExportButton from "../../components/common/ExportButton";
import {
  getJobsApi,
  deleteJobApi,
  siteService,
} from "../../services/auth.service";
import type { Job, Site } from "../../types/auth.types";

interface POCodeRow {
  id: string;
  code: string;
  date: string;
  pickup: string;
  deliver: string;
  material: string;
  customer: string;
  thirdPartyCustomer: string;
  rate: string;
}

const columns = [
  { label: "Code", key: "code" },
  { label: "Date", key: "date" },
  { label: "Pickup", key: "pickup", width: "130px" },
  { label: "Deliver", key: "deliver", width: "130px" },
  { label: "Material", key: "material" },
  { label: "Customer", key: "customer", width: "120px" },
  {
    label: "Third Party Customer",
    key: "thirdPartyCustomer",
    width: "200px",
  },
  {
    label: "Rate",
    key: "rate",
    width: "90px",
  },
  { label: "Details", key: "actions", minWidth: "100px" },
];

const POCode = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [search, setSearch] = useState("");
  const [hidePoModal, setHidePoModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [siteMap, setSiteMap] = useState<Record<string, string>>({});
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSites = useCallback(async () => {
    const [pickupRes, deliverRes] = await Promise.all([
      siteService.getSites({ type: "pickup", limit: 100 }),
      siteService.getSites({ type: "deliver", limit: 100 }),
    ]);

    const map: Record<string, string> = {};
    [...pickupRes.data, ...deliverRes.data].forEach((site: Site) => {
      map[site._id] = site.name;
    });
    setSiteMap(map);
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJobsApi(1, 100);
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to load PO codes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
    loadJobs();
  }, [loadSites, loadJobs]);

  const tableData: POCodeRow[] = jobs.map((job) => ({
    id: job._id,
    code: job.code,
    date: job.date ? new Date(job.date).toLocaleDateString("en-GB") : "-",
pickup:
  job.pickupSiteId &&
  typeof job.pickupSiteId === "object"
    ? job.pickupSiteId.name
    : "-",

deliver:
  job.deliverySiteId &&
  typeof job.deliverySiteId === "object"
    ? job.deliverySiteId.name
    : "-",

customer:
  job.customerId &&
  typeof job.customerId === "object"
    ? job.customerId.name
    : "-",

material:
  job.materialId &&
  typeof job.materialId === "object"
    ? job.materialId.name
    : "-",
thirdPartyCustomer:
  job.thirdPartyCustomerId &&
  typeof job.thirdPartyCustomerId === "object"
    ? job.thirdPartyCustomerId.name
    : job.thirdPartyCustomerId ?? "----",
    rate: `$${Number(job.rate).toFixed(2)}`,
  }));

  const filteredData = tableData.filter((item) => {
    const value = search.toLowerCase();

    return (
      item.code.toLowerCase().includes(value) ||
      item.date.toLowerCase().includes(value) ||
      item.pickup.toLowerCase().includes(value) ||
      item.deliver.toLowerCase().includes(value) ||
      item.material.toLowerCase().includes(value) ||
      item.customer.toLowerCase().includes(value) ||
      item.thirdPartyCustomer.toLowerCase().includes(value) ||
      item.rate.toLowerCase().includes(value)
    );
  });

  const handleOpenPickupModal = () => {
    setHidePoModal(true);
    setOpenPickupModal(true);
  };

  const handleClosePickupModal = () => {
    setOpenPickupModal(false);
    setHidePoModal(false);
  };

  const handleEdit = (row: POCodeRow) => {
    const job = jobs.find((j) => j._id === row.id);
    if (job) {
      setSelectedJob(job);
      setEditModal(true);
    }
  };

  const handleDelete = async (row: POCodeRow) => {
    try {
      await deleteJobApi(row.id);
      await loadJobs();
    } catch (err) {
      console.error("Failed to delete PO code:", err);
    }
  };

  const handleRefresh = async () => {
    await loadJobs();
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
    }, 3000);
  };

  const handleModalSuccess = () => {
    loadJobs();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PO Code"
        description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
      >
        {" "}
        <div className="flex flex-wrap items-center gap-[0.6vw] ml-auto">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="max-w-xs 2xl:max-w-none 2xl:w-[230px] h-[36px] border border-[#E4E7EC] rounded-[5px] bg-white pl-8 pr-4 outline-none text-xs 2xl:text-sm"
            />
          </div>

          {/* Create Button */}
          <CommonButton
            onClick={() => setOpenModal(true)}
            variant="primary"
            size="xs"
            icon={<PlusCircle size={18} />}
          >
            Create PO Code
          </CommonButton>

          {/* Export */}
          <ExportButton
            onClick={() => {
              console.log("Export started...");
            }}
          />

          {/* Refresh */}
          <CommonButton
            size="xs"
            variant="secondary"
            iconOnly
            icon={<RefreshCcw size={14} />}
            onClick={handleRefresh}
          />
        </div>
      </PageHeader>

      <Table
        columns={columns}
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        minWidth="min-w-[1100px]"
        // loading={loading}
      />

      <CreatePOCodeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onOpenPickupModal={handleOpenPickupModal}
        onSuccess={handleModalSuccess}
      />

      <CreatePOCodeModal
        open={editModal && !hidePoModal}
        onClose={() => {
          setEditModal(false);
          setHidePoModal(false);
          setSelectedJob(null);
        }}
        isEdit
        job={selectedJob}
        onOpenPickupModal={handleOpenPickupModal}
        onSuccess={handleModalSuccess}
      />

      <CreatePickupModal
        open={openPickupModal}
        onClose={handleClosePickupModal}
      />

      <LoadUpdateSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default POCode;
