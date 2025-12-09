"use client";

import { useEffect, useState } from "react";

export default function ReceptionistsPage() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchReceptionists = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        search,
        page,
        limit,
      });
      const res = await fetch(`/api/receptionists?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReceptionists(data.data || []);
        setTotal(data.total || 0);
      } else {
        setReceptionists([]);
        setTotal(0);
        setError(data.error || "Failed to fetch receptionists");
      }
    } catch (err) {
      setReceptionists([]);
      setTotal(0);
      setError(err.message || "Failed to fetch receptionists");
    } finally {
      setLoading(false);
    }
  };

  const deleteReceptionist = async (id) => {
    if (!confirm("Are you sure you want to delete this receptionist?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/receptionists", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        // Supprime le receptionist de l'état local pour mise à jour immédiate
        setReceptionists(receptionists.filter((r) => r.id !== id));
        setTotal((t) => t - 1);
        alert("Receptionist deleted successfully");
      } else {
        alert(data.error || "Failed to delete receptionist");
      }
    } catch (err) {
      alert(err.message || "Failed to delete receptionist");
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Receptionists</h1>
        <a
          href="/dashboard/admin-clinc-dashboard/receptionists/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Receptionist
        </a>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {loading ? (
        <p>Loading receptionists...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {receptionists.length > 0 ? (
                receptionists.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{r.id}</td>
                    <td className="border px-4 py-2">{r.name}</td>
                    <td className="border px-4 py-2">{r.email}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => deleteReceptionist(r.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No receptionists found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
