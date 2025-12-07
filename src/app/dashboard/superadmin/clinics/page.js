"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Récupère le token depuis localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchClinics = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (!json || !json.meta) {
        console.error("Invalid response from API", json);
        return;
      }

      setClinics(json.data);
      setPagination({
        page: json.meta.page,
        pages: json.meta.pages,
        total: json.meta.total,
      });
    } catch (err) {
      console.error("Error fetching clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const openModal = async (id) => {
    try {
      const res = await fetch(`/api/clinics?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setSelectedClinic(json);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching clinic details:", err);
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

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{clinic.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {clinic.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {clinic.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {clinic.subscriptionStatus || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openModal(clinic.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
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

              <div className="space-y-2">
                <p>
                  <strong>Phone:</strong> {selectedClinic.clinic.phone}
                </p>
                <p>
                  <strong>Address:</strong> {selectedClinic.clinic.address}
                </p>
                <p>
                  <strong>Tax ID:</strong> {selectedClinic.clinic.taxId}
                </p>
                <p>
                  <strong>Subscription:</strong>{" "}
                  {selectedClinic.clinic.subscriptionType} (
                  {selectedClinic.clinic.subscriptionStatus})
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
