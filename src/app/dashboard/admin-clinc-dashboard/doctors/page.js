"use client";

import { useEffect, useState } from "react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // items par page
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch spécialités
  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté"); // utiliser setError car setMessage n'existe pas ici
        return;
      }

      const res = await fetch("/api/specializations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // Vérifie si data.data existe et est un tableau
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      setSpecializations(list);

      // sélectionner la première spécialité par défaut
      if (list.length > 0) setSelectedSpec(list[0].name); // <-- ici
    } catch (err) {
      console.error(err);
      setError("Erreur serveur.");
      setSpecializations([]);
    }
  };

  // fetch docteurs avec search / spec / pagination
  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté");

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedSpec) params.append("specialization", selectedSpec);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/doctors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error || "Erreur serveur");

      setDoctors(result.data.data || []);
      setTotal(result.data.total || 0);
    } catch (err) {
      console.error("Erreur fetch doctors:", err);
      setError(err.message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [search, selectedSpec, page]);

  // delete doctor
  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce docteur ?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté");

      const res = await fetch("/api/doctors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur suppression");

      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Liste des Docteurs</h1>

        {/* Bouton Ajouter docteur */}
        <button
          onClick={() =>
            (window.location.href =
              "/dashboard/admin-clinc-dashboard/doctors/new")
          } // mettre l'URL de la page register
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Ajouter un docteur
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email"
          className="border px-3 py-2 rounded"
          value={search}
          onChange={(e) => {
            setPage(1); // reset page
            setSearch(e.target.value);
          }}
        />

        <select
          className="border px-3 py-2 rounded"
          value={selectedSpec}
          onChange={(e) => {
            setPage(1); // reset page
            setSelectedSpec(e.target.value);
          }}
        >
          <option value="">Toutes les spécialisations</option>
          {specializations.map((spec) => (
            <option key={spec.id} value={spec.name}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table docteurs */}
      {!loading && doctors.length === 0 && <p>Aucun docteur trouvé.</p>}

      {!loading && doctors.length > 0 && (
        <>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Spécialisation</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{doc.name || "-"}</td>
                  <td className="px-4 py-2">{doc.email || "-"}</td>
                  <td className="px-4 py-2">{doc.specializationName || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1">
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
