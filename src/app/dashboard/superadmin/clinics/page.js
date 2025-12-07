"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchClinics = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/clinics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json?.data) return;

      setClinics(json.data);
      setPagination({
        page: json.meta?.page || 1,
        pages: json.meta?.pages || 1,
        total: json.meta?.total || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics(pagination.page);
  }, [pagination.page, search]);

  const openModal = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/clinics?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json?.clinic) return;
      setSelectedClinic(json);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-textPrimary mb-6">Clinics</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name or taxId..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="px-3 py-2 border rounded-lg w-full max-w-sm text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-textSecondary">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg max-w-5xl mx-auto">
          <table className="min-w-max w-[900px] mx-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Name",
                  "Phone",
                  "Address",
                  "Admin Email",
                  "Subscription Status",
                  "Actions",
                ].map((th) => (
                  <th
                    key={th}
                    className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">{clinic.name}</td>
                  <td className="px-4 py-3 text-sm">{clinic.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm">{clinic.address || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {clinic.adminEmail || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                      {clinic.subscriptionStatus || "N/A"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openModal(clinic.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 px-4 pb-4">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {pagination.page} / {pagination.pages}
            </span>

            <button
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedClinic && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-medium mb-4">
                {selectedClinic.clinic.name}
              </Dialog.Title>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Admin Email:</strong>{" "}
                  {selectedClinic.clinic.adminEmail || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedClinic.clinic.phone || "-"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedClinic.clinic.address || "-"}
                </p>
                <p>
                  <strong>Tax ID:</strong> {selectedClinic.clinic.taxId}
                </p>
                <p>
                  <strong>Subscription:</strong>{" "}
                  {selectedClinic.clinic.subscriptionType}
                </p>
                <p>
                  <strong>Total Invoices Amount:</strong>{" "}
                  {selectedClinic.totals?.invoicesAmount || 0}
                </p>
                <p>
                  <strong>Staff Count:</strong>{" "}
                  {selectedClinic.counts?.staff || 0}
                </p>
                <p>
                  <strong>Appointments:</strong>{" "}
                  {selectedClinic.counts?.appointments || 0}
                </p>
                <p>
                  <strong>Patients:</strong>{" "}
                  {selectedClinic.counts?.patients || 0}
                </p>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
