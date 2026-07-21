import { useEffect, useMemo, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import PageHeader from "../../components/common/PageHeader";
import TableFilters from "../../components/common/TableFilters";
import Table from "../../components/common/Table";
import CreatePickupModal from "../../components/pickup/modal/CreatePickupModal";
import CalendarModal from "../../components/common/modal/CalendorModal";
import CommonButton from "../../components/common/CommonButton";
import type { Site } from "../../types/auth.types";
import { siteService } from "../../services/auth.service";

const columns = [
  { label: "#", key: "id", width: "70px" },
  { label: "Customer", key: "customer" },
  { label: "Type", key: "type" },
  { label: "Pickup/Deliver", key: "pickupDeliver" },
  { label: "Contractor Rate", key: "contractorRate" },
  { label: "Invoice Rate", key: "invoiceRate" },
  { label: "Details", key: "actions" },
];

interface PickupRow {
  id: number;
  siteId: string;
  customer: string;
  type: string;
  pickupDeliver: string;
  contractorRate: string;
  invoiceRate: string;
  date: string;
  raw: Site;
}

const mapSiteToRow = (site: Site, index: number): PickupRow => ({
  id: index + 1,
  siteId: site._id,
  customer: site.customerId?.name || "—",
  type: site.type === "pickup" ? "Pickup" : "Deliver",
  pickupDeliver: site.name,
  contractorRate: `$${site.contractorRate.toFixed(2)}`,
  invoiceRate: `$${site.invoiceRate.toFixed(2)}`,
  date: site.createdAt,
  raw: site,
});

const PickupPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [openEditPickup, setOpenEditPickup] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [selectedDate, setSelectedDate] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);

  const fetchSites = useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      setLoading(true);
      setFetchError("");

      try {
        const res = await siteService.getSites({ page, limit });

        setSites(res.data || []);
        setPagination(res.pagination);
      } catch (err: unknown) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load sites.",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit],
  );

  useEffect(() => {
    void fetchSites(pagination.page, pagination.limit);
  }, [fetchSites, pagination.page, pagination.limit]);

const handleDeleteSite = async (siteId: string) => {
  try {
    await siteService.deleteSite(siteId);
    await fetchSites(pagination.page, pagination.limit);
  } catch (err) {
    console.log(err);
  }
};

  const formatDateRange = () => {
    const [start, end] = selectedDate;

    if (!start && !end) return "";

    if (start && !end) return start.format("DD/MM/YYYY");

    if (start && end) {
      return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
    }

    return "";
  };

  const rows = useMemo(
    () =>
      sites.map((site, index) => ({
        ...mapSiteToRow(site, index),
        id: (pagination.page - 1) * pagination.limit + index + 1,
      })),
    [sites, pagination.page, pagination.limit],
  );

  const filteredData = rows
    .filter((item) => {
      if (!search) return true;

      return (
        item.customer.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.pickupDeliver.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((item) => {
      const [start, end] = selectedDate;

      if (!start && !end) return true;

      const itemDate = dayjs(item.date);

      if (start && !end) {
        return itemDate.isSame(start, "day");
      }

      if (start && end) {
        return (
          itemDate.isSame(start, "day") ||
          itemDate.isSame(end, "day") ||
          (itemDate.isAfter(start, "day") && itemDate.isBefore(end, "day"))
        );
      }

      return true;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pickup/Deliver"
        description="Enables you to track the status of the loads"
      >
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          <CommonButton
            size="md"
            variant="primary"
            onClick={() => setOpenModal(true)}
          >
            <PlusCircle size={18} />
            Create Pickup/Deliver
          </CommonButton>
        </div>
      </PageHeader>

      <div className="bg-white">
        <TableFilters
          searchValue={search}
          onSearchChange={setSearch}
          dateRange={formatDateRange()}
          onDateClick={() => setOpenCalendarModal(true)}
          entries={entries}
          onEntriesChange={(val) => {
            setEntries(val);
            setPagination((prev) => ({
              ...prev,
              page: 1,
              limit: val,
            }));
          }}
        />

        {loading && (
          <p className="text-center text-[#717182] py-6">Loading sites...</p>
        )}

        {!loading && fetchError && (
          <p className="text-center text-red-500 py-6">{fetchError}</p>
        )}

        {!loading && !fetchError && (
          <Table
            columns={columns}
            data={filteredData}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => {
              fetchSites(page, pagination.limit);
            }}
            onEdit={(row: PickupRow) => {
              setEditingSite(row.raw);
              setOpenEditPickup(true);
            }}
            onDelete={(row: PickupRow) => handleDeleteSite(row.siteId)}
            minWidth="min-w-[1000px]"
          />
        )}
      </div>

      <CreatePickupModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchSites}
      />

      <CreatePickupModal
        open={openEditPickup}
        onClose={() => {
          setOpenEditPickup(false);
          setEditingSite(null);
        }}
        isEdit
        editingSite={editingSite}
        onSuccess={fetchSites}
      />

      <CalendarModal
        isOpen={openCalendarModal}
        onClose={() => setOpenCalendarModal(false)}
        onApply={setSelectedDate}
      />
    </div>
  );
};

export default PickupPage;
