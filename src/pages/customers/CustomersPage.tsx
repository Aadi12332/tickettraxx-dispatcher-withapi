import { useEffect, useState } from "react";
import { PlusCircle, RefreshCcw } from "lucide-react";
import axios from "axios";
import PageHeader from "../../components/common/PageHeader";
import TableFilters from "../../components/common/TableFilters";
import Table from "../../components/common/Table";
import CommonButton from "../../components/common/CommonButton";
import CreateCustomerModal from "../../components/customers/modal/CreateCustomerModal";
import LoadUpdateSuccessModal from "../../components/common/modal/LoadUpdateSuccessModal";
import ExportButton from "../../components/common/ExportButton";
import {
  getCustomersApi,
  deleteCustomerApi,
} from "../../services/auth.service";
import type { Customer } from "../../types/auth.types";

const customerColumns = [
  { label: "#", key: "id" },
  { label: "Name", key: "name" },
  { label: "Contact Name", key: "contactName" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "Address", key: "address" },
  { label: "Details", key: "actions" },
];

type CustomerRow = Customer & { id: string; name: string; contactName?: string; email?: string; phone?: string; address?: string };

const CustomersPage = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openEditCustomer, setOpenEditCustomer] = useState(false);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null,
  );

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchCustomers = async (pageNum = pagination.page, limit = entries) => {
    setLoading(true);
    setError("");
    try {
      const res = await getCustomersApi(pageNum, limit);

      setCustomers(res.data);
      setPagination(res.pagination);
    } catch {
      setError("Unable to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(pagination.page, entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, entries]);

  const handleRefresh = () => {
    fetchCustomers(pagination.page, entries);
  };

  const handleCreateSuccess = () => {
    setSuccessTitle("You have successfully created the customer.");
    setShowSuccessModal(true);
    fetchCustomers(pagination.page, entries);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleUpdateSuccess = () => {
    setSuccessTitle("You have successfully updated the customer.");
    setShowSuccessModal(true);
    fetchCustomers(pagination.page, entries);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const handleDelete = async (item: CustomerRow) => {
    try {
      await deleteCustomerApi(item._id);
      fetchCustomers(pagination.page, entries);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to delete customer.");
      } else {
        setError("Unable to delete customer.");
      }
    }
  };

  const rows = customers.map((customer, index) => ({
    ...customer,
    id: (pagination.page - 1) * pagination.limit + index + 1,
    name: customer.name,
    contactName: (customer as any).contactName || "",
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address || "",
  }));

  const filteredCustomers = rows.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.contactName || "").toLowerCase().includes(q) ||
      (item.email || "").toLowerCase().includes(q) ||
      (item.phone || "").toLowerCase().includes(q) ||
      (item.address || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer"
        description="Create, edit and deactivate Customer"
      >
        <div className="flex flex-wrap items-center lg:gap-3 gap-1 ml-auto">
          <CommonButton
            variant="primary"
            size="md"
            icon={<PlusCircle size={18} />}
            onClick={() => setOpenModal(true)}
          >
            Add Customer
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
            Loading customers...
          </p>
        ) : (
          <Table
            columns={customerColumns}
            data={filteredCustomers}
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => {
              fetchCustomers(page, pagination.limit);
            }}
            onEdit={(item) => {
              setSelectedCustomer(item as CustomerRow);
              setOpenEditCustomer(true);
            }}
            onDelete={(item) => handleDelete(item as CustomerRow)}
            minWidth="min-w-[500px]"
          />
        )}
      </div>

      <CreateCustomerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <CreateCustomerModal
        open={openEditCustomer}
        onClose={() => {
          setOpenEditCustomer(false);
          setSelectedCustomer(null);
        }}
        isEdit
        editData={selectedCustomer}
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

export default CustomersPage;
