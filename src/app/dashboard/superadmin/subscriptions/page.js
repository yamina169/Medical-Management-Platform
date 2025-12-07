"use client";

import { useEffect, useState } from "react";

export default function SubscriptionsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🔍 Filtres
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const limit = 5;

  const fetchClinics = async (p = page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: p,
        limit,
        search,
        type,
        status,
      }).toString();

      const res = await fetch(`/api/subscriptions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setClinics(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [page, search, type, status]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Subscription Management</h1>

      {/* 🔍 Filtres */}
      <div className="flex gap-4 mb-6">
        <input
          className="border p-2 rounded w-48"
          placeholder="Search clinic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="TRIAL">TRIAL</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* TABLE */}
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
              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{clinic.name}</td>
                    <td className="px-6 py-4">{clinic.subscriptionType}</td>
                    <td className="px-6 py-4">{clinic.subscriptionStatus}</td>
                    <td className="px-6 py-4">
                      {clinic.subscriptionStart
                        ? new Date(
                            clinic.subscriptionStart
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
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
          <div className="mt-4 flex justify-center gap-3">
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              className="px-3 py-1 bg-gray-200 rounded"
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
