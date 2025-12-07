"use client";

import { useEffect, useState } from "react";

export default function SubscriptionsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchClinics = async (p = page) => {
    setLoading(true);
    try {
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/subscriptions?page=${p}&limit=${limit}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setClinics(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      } else {
        console.error("Error fetching clinics:", data.error);
      }
    } catch (err) {
      console.error("Error fetching clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Subscription Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Subscription Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Start At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                    Ends At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {clinic.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {clinic.subscriptionType}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {clinic.subscriptionStatus}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {clinic.subscriptionStart
                        ? new Date(
                            clinic.subscriptionStart
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {clinic.subscriptionEnd
                        ? new Date(clinic.subscriptionEnd).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center items-center gap-3">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
