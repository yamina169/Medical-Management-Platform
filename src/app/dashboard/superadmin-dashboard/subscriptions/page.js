"use client";

import { useEffect, useState } from "react";

export default function SubscriptionsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const limit = 5;

  const fetchClinics = async (p = page) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login.");

      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
      });

      if (searchText) params.append("search", searchText);
      if (subscriptionType) params.append("subscriptionType", subscriptionType);
      if (subscriptionStatus)
        params.append("subscriptionStatus", subscriptionStatus);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/subscriptions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch clinics");
      }

      const data = await res.json();
      if (data.success) {
        setClinics(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      } else {
        throw new Error(data.error || "Failed to fetch clinics");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics(page);
  }, [
    page,
    searchText,
    subscriptionType,
    subscriptionStatus,
    startDate,
    endDate,
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Subscription Management
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by clinic name"
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={subscriptionType}
          onChange={(e) => setSubscriptionType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Types</option>
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
        <select
          value={subscriptionStatus}
          onChange={(e) => setSubscriptionStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="TRIAL">TRIAL</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
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
              {clinics.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No clinics found
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {clinic.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {clinic.subscriptionType}
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        clinic.subscriptionStatus === "EXPIRED"
                          ? "text-red-500"
                          : clinic.subscriptionStatus === "ACTIVE"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg disabled:opacity-50 hover:bg-blue-200 transition"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg disabled:opacity-50 hover:bg-blue-200 transition"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
